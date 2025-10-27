import { Injectable } from '@nestjs/common';
import Fuse, { IFuseOptions } from 'fuse.js';
import { messageErr } from 'src/common/helper/message';

interface FAQItem {
  questions: string[];
  answer: string;
}

@Injectable()
export class SearchService {
  private readonly fuseOptions: IFuseOptions<FAQItem> = {
    keys: ['questions'],
    threshold: 0.3, // Càng nhỏ → kết quả càng chính xác
    includeScore: true,
    ignoreLocation: true,
    ignoreFieldNorm: true,
  };

  /*Chuẩn hóa text để so sánh tìm kiếm (ví dụ: loại bỏ dấu tiếng Việt)*/
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      // .normalize('NFD') // tách ký tự có dấu thành chữ cái + dấu tách biệt :  yến => y + ̂ (dấu mũ) + e + ́ (dấu sắc) + n
      // .replace(/[\u0300-\u036f]/g, '') // loại bỏ dấu tiếng Việt sau khi tách dấu
      // .replace(/[^a-z0-9\s]/g, '') // loại bỏ ký tự đặc biệt
      .trim();
  }

  /*Tìm câu trả lời gần đúng nhất trong danh sách FAQ*/
  findAnswer(query: string, faqData: FAQItem[]): string {
    if (!faqData?.length) {
      return messageErr.faqEmpty;
    }

    // Chuẩn hóa dữ liệu
    const normalizedData = faqData.map((item) => ({
      ...item,
      questions: item.questions.map((q) => this.normalizeText(q)),
    }));

    // Khởi tạo Fuse.js với dữ liệu chuẩn hóa
    const fuse = new Fuse(normalizedData, this.fuseOptions);
    const normalizedQuery = this.normalizeText(query);

    // Thực hiện tìm kiếm
    const results = fuse.search(normalizedQuery);

    // Nếu không tìm thấy kết quả phù hợp
    if (results.length === 0) {
      return messageErr.cannotReply;
    }

    // Lấy kết quả phù hợp nhất
    return results[0].item.answer;
  }
}
