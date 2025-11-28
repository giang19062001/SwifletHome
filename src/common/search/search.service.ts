import { Injectable } from '@nestjs/common';
import Fuse, { IFuseOptions } from 'fuse.js';
import { fuseConfig, ISearchItem } from 'src/config/search.config';
import { Msg } from 'src/helpers/message.helper';
import { UploadService } from 'src/modules/upload/upload.service';
import { LoggingService } from '../logger/logger.service';

@Injectable()
export class SearchService {
  private readonly fuseOptions: IFuseOptions<ISearchItem> = fuseConfig;
  private readonly SERVICE_NAME = 'SearchService';

  constructor(
    private readonly uploadService: UploadService,
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
  async replyBaseOnUserPackage(contentHtml: string, isFree: string, packageRemainDays: number): Promise<string> {
    const logbase = `${this.SERVICE_NAME}/replyBaseOnUserPackage`;
    this.logger.log(logbase, `Dữ liệu là miễn phí: ${isFree}; Số ngày hiệu lực còn lại của gói user:${packageRemainDays}`);

    // LẤY DANH SÁCH AUDIO LIST
    const fileList = await this.uploadService.getAllAudioFile();
    // HANDLE
    let content = contentHtml;
    if (isFree === 'Y') {
      // dữ liệu miễn phí → XÓA nút thanh toán
      content = content.replace(/\[\[payment\]\]/g, ``);
    } else if (isFree === 'N') {
      // dữ liệu tính phí
      // TODO: [PAYMENT]
      if (packageRemainDays > 0) {
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
      content = content.replace(/\[\[audio-data=([^\]]+)\]\]/g, (match, url) => {
        const lastSlashIndex = url.lastIndexOf('/');
        const fileUrl = url.substring(0, lastSlashIndex);
        const filename = url.substring(lastSlashIndex + 1);

        const fileInfo = fileList?.find((ele) => ele.filename === filename);
        const audioPay = fileInfo?.filenamePay || filename;

        const audioSrc = packageRemainDays <= 0 ? `${url}` : `${fileUrl}/${audioPay}`;

        return `[[audio-data='${audioSrc}']]`;
      });
    }
    return content;
  }

  async reply(question: string, packageRemainDays: number, data: ISearchItem[]): Promise<string> {
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
    return results[0].item.answer ? await this.replyBaseOnUserPackage(results[0].item.answer.answerContent, results[0].item.answer.isFree, packageRemainDays) : Msg.CannotReply;
  }
}
