import { Injectable } from '@nestjs/common';
import Fuse, { IFuseOptions } from 'fuse.js';
import { Msg } from 'src/helpers/message.helper';
import { UploadAppService } from 'src/modules/upload/app/upload.service';
import { UserAppService } from 'src/modules/user/app/user.service';
import { QuestionResDto } from 'src/modules/question/question.response';
import { FileUploadResDto } from '../../modules/upload/upload.response';
import { LoggingService } from '../logger/logger.service';
import { IChatItem } from './chat.interface';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class ChatService {
  private readonly fuseOptions: IFuseOptions<IChatItem> = {
    keys: [{ name: 'questions', weight: 1 }],
    threshold: 0.4,
    distance: 10, // cho phép lệch vị trí
    minMatchCharLength: 5, // tránh match quá ngắn
    includeScore: true,
    ignoreLocation: true,
    ignoreFieldNorm: false,
    shouldSort: true,
    useExtendedSearch: false,
  };

  private readonly SERVICE_NAME = 'ChatService';

  constructor(
    private readonly uploadAppService: UploadAppService,
    private readonly userAppService: UserAppService,
    private readonly llmService: LlmService,
    private readonly logger: LoggingService,
  ) {}

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  handleAudio(content: string, remainDay: number, isFree: string, fileList: FileUploadResDto[]) {
    // TODO: [AUDIO]
    return content.replace(/\[\[audio-data=([^\]]+)\]\]/g, (match, url) => {
      const baseUrl = url.split('/').slice(0, 3).join('/');

      // console.log('baseUrl', baseUrl);
      console.log('remainDay --->', remainDay);
      const lastSlashIndex = url.lastIndexOf('/');
      const filename = url.substring(lastSlashIndex + 1); // free
      console.log('filename --->', filename);

      const fileInfo = fileList?.find((ele) => ele.filename.includes(filename));
      // console.log('fileInfo', fileInfo);

      const audioPay = fileInfo?.filenamePay || undefined; // pay
      console.log('audioPay --->', audioPay);

      // nếu file dạng miễn phí -> nghe file ( pay )
      // nếu file dạng tính phí && user còn hạn gói nâng cấp -> ghe file ( pay )
      // nếu file dạng tính phí && user hết hạn gói nâng cấp -> ghe file ( free )
      const audioSrc = isFree == 'Y' ? `${baseUrl}/${audioPay}` : isFree == 'N' && remainDay <= 0 ? `${url}` : `${baseUrl}/${audioPay}`;
      //  const audioSrc = remainDay <= 0 ? `${url}` : `${fileUrl}/${audioPay}`;

      console.log('audioSrc --->', audioSrc);

      return `[[audio-data=${audioSrc}]]`;
    });
  }
  
  async replyBaseOnUserPackage(contentHtml: string, isFree: string, userCode: string): Promise<string> {
    const logbase = `${this.SERVICE_NAME}/replyBaseOnUserPackage`;
    // lấy thông tin gói của user
    const userPackage = await this.userAppService.getUserPackageInfo(userCode);
    const remainDay = userPackage?.packageRemainDay ?? 0;

    // LẤY DANH SÁCH AUDIO LIST
    const fileList = await this.uploadAppService.getAllAudioFile();
    // HANDLE
    let content = contentHtml;
    if (isFree === 'Y') {
      // dữ liệu miễn phí → XÓA nút thanh toán
      content = content.replace(/\[\[payment\]\]/g, ``);
      // TODO: [AUDIO]
      content = this.handleAudio(content, remainDay, isFree, fileList);
    } else if (isFree === 'N') {
      // dữ liệu tính phí
      // TODO: [[payment]]

      if (remainDay > 0) {
        // người dùng đang xài gói nâng cấp và còn hạn → ẩn nút thanh toán
        content = content.replace(/\[\[payment\]\]/g, ``);
      } else {
        // người dùng đang xài gói miễn phí hoặc hết hạn → giữ nguyên nút thanh toán
        if (content.includes('[[payment]]')) {
          // Chỉ giữ phần trước + nút thanh toán
          const parts = content.split('[[payment]]');

          // bỏ nội dung phía sau nút thanh toán
          content = parts[0] + `[[payment]]`;
        } else {
          content = content;
        }
      }
      // TODO: [AUDIO]
      content = this.handleAudio(content, remainDay, isFree, fileList);
    }
    return content;
  }

  async reply(question: string, userCode: string, data: IChatItem[], allQuestions: QuestionResDto[] = []): Promise<string> {
    const logbase = `${this.SERVICE_NAME}/reply`;

    if (!data?.length) {
      return Msg.CannotReply;
    }

    // 1. Phân loại bằng Fuse.js trước (tìm kiếm tương đương tuyệt đối)
    const normalizedData = data.map((item) => ({
      ...item,
      questions: item.questions.map((q) => this.normalizeText(q)),
    }));

    const fuse = new Fuse<IChatItem>(normalizedData, this.fuseOptions);
    const normalizedQuestion = this.normalizeText(question);

    const results = fuse.search(normalizedQuestion);

    // Nếu tìm thấy kết quả bằng Fuse.js Trả về luôn
    const bestResult = results[0];
    if (bestResult && bestResult.score !== undefined && bestResult.item.answer) {
      this.logger.log(logbase, `Bot trả lời thông qua Fusejs`);
      return await this.replyBaseOnUserPackage(bestResult.item.answer.answerContent, bestResult.item.answer.isFree, userCode);
    }

    // 2. Sử dụng LLM để phân tích ngữ cảnh (Fallback)
    if (allQuestions && allQuestions.length > 0) {
      const { answerCode: llmAnswerCode } = await this.llmService.replyWithLLM(question, allQuestions);

      if (llmAnswerCode) {
        const matchedItem = data.find((item) => item.answerCode === llmAnswerCode);
        if (matchedItem && matchedItem.answer) {
          this.logger.log(logbase, `Bot trả lời thông qua LLM (Code: ${llmAnswerCode})`);
          return await this.replyBaseOnUserPackage(matchedItem.answer.answerContent, matchedItem.answer.isFree, userCode);
        }
      }
    }

    this.logger.log(logbase, `Không tìm thấy câu trả lời phù hợp cho cả Fusejs và LLM`);
    return Msg.CannotReply;
  }
}
