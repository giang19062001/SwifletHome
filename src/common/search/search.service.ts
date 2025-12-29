import { Injectable } from '@nestjs/common';
import Fuse, { IFuseOptions } from 'fuse.js';
import { Msg } from 'src/helpers/message.helper';
import { LoggingService } from '../logger/logger.service';
import { UserAppRepository } from 'src/modules/user/app/user.repository';
import { ISearchItem } from './search.interface';
import { UploadAppService } from 'src/modules/upload/app/upload.service';
import { IFileUpload } from 'src/modules/upload/upload.interface';

@Injectable()
export class SearchService {
  private readonly fuseOptions: IFuseOptions<ISearchItem> = {
    keys: ['questions'],
    threshold: 0.3, // Nhỏ hơn → kết quả chính xác hơn
    includeScore: true,
    ignoreLocation: true,
    ignoreFieldNorm: true,
  };
  private readonly SERVICE_NAME = 'SearchService';

  constructor(
    private readonly uploadAppService: UploadAppService,
    private readonly userAppRepository: UserAppRepository,
    private readonly logger: LoggingService,
  ) {}

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD') // tách dấu với ký tự
      .replace(/[\u0300-\u036f]/g, '') // xóa dấu tiếng Việt sau khi tách dấu
      .replace(/[^a-z0-9\s]/g, '') // xóa ký tự đặc biệt
      .trim();
  }
  handleAudio(content: string, remainDay: number, isFree: string, fileList: IFileUpload[]) {
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
    const userPackage = await this.userAppRepository.getUserPackageInfo(userCode);
    const remainDay = userPackage?.packageRemainDay ?? 0;

    // this.logger.log(logbase, `Dữ liệu là miễn phí: ${isFree}; Số ngày hiệu lực còn lại của gói user:${remainDay}`);

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

  async reply(question: string, userCode: string, data: ISearchItem[]): Promise<string> {
    if (!data?.length) {
      return Msg.CannotReply;
    }

    // dữ liệu đã chuẩn hóa
    const normalizedData = data.map((item) => ({
      ...item,
      questions: item.questions.map((q) => this.normalizeText(q)),
    }));

    // Khởi tạo fuse với dữ liệu đã chuẩn hóa
    const fuse = new Fuse(normalizedData, this.fuseOptions);
    const normalizedQuestion = this.normalizeText(question);

    // tìm kiếm...
    const results = fuse.search(normalizedQuestion);
    // Nếu không tìm thấy kết quả phù hợp
    if (results.length === 0) {
      return Msg.CannotReply;
    }

    // Lấy kết quả phù hợp nhất
    return results[0].item.answer ? await this.replyBaseOnUserPackage(results[0].item.answer.answerContent, results[0].item.answer.isFree, userCode) : Msg.CannotReply;
  }
}
