import { Injectable } from '@nestjs/common';
import Fuse, { IFuseOptions } from 'fuse.js';
import { fuseConfig, ISearchItem } from 'src/config/fuse';
import { messageErr } from 'src/helpers/message';

@Injectable()
export class SearchService {
  private readonly fuseOptions: IFuseOptions<ISearchItem> = fuseConfig;

  // Standardize text for search comparison
  private normalizeText(text: string): string {
    return (
      text
        .toLowerCase()
        // .normalize('NFD') // tách các ký tự có dấu thành các chữ cái + dấu phân cách: yen => y + ̂ (dấu mũ) + e + ́ (dấu thăng) + n
        // .replace(/[\u0300-\u036f]/g, '') // xóa dấu tiếng Việt sau khi tách dấu
        // .replace(/[^a-z0-9\s]/g, '') // xóa ký tự đặc biệt
        .trim()
    );
  }

  /*Tìm câu trả lời gần nhất trong danh sách Câu hỏi thường gặp*/
  findAnswer(query: string, faqData: ISearchItem[]): string {
    if (!faqData?.length) {
      return messageErr.faqEmpty;
    }

    // dữ liệu đã chuẩn hóa
    const normalizedData = faqData.map((item) => ({
      ...item,
      questions: item.questions.map((q) => this.normalizeText(q)),
    }));

    // Khởi tạo Fuse.js với dữ liệu đã chuẩn hóa
    const fuse = new Fuse(normalizedData, this.fuseOptions);
    const normalizedQuery = this.normalizeText(query);

    // tìm kiếm...
    const results = fuse.search(normalizedQuery);

    // Nếu không tìm thấy kết quả phù hợp
    if (results.length === 0) {
      return messageErr.cannotReply;
    }

    // Lấy kết quả phù hợp nhất
    return results[0].item.answer;
  }
}
