import { Injectable } from '@nestjs/common';
import Fuse from 'fuse.js';
import { messageErr } from 'src/common/message';

@Injectable()
export class SearchService {
  private normalizeText(text: string): string {
    return text.toLowerCase();
    // .normalize('NFD')
    // .replace(/[\u0300-\u036f]/g, '') // remove Vietnamese accents :  yến => yen
    // .replace(/[^a-z0-9\s]/g, '');
  }

  findAnswer(query: string, faqData: any[]): string {
    if (!faqData || faqData.length === 0) {
      return messageErr.faqEmpty;
    }
    const normalizedData = faqData.map((item) => ({
      ...item,
      questions: item.questions.map((q: string) => this.normalizeText(q)),
    }));

    const fuse = new Fuse(normalizedData, {
      keys: ['questions'],
      threshold: 0.3, // Số CÀNG NHỎ -> kết quả CÀNG CHÍNH XÁC
      includeScore: true, // điểm số matching để biết độ chính xác => Điểm càng thấp càng tốt
      ignoreLocation: true, // không quan tâm từ khóa ở đầu/cuối/giữa
      ignoreFieldNorm: true, // Ngăn không cho trường ngắn được ưu tiên hơn trường dài
    });

    const normalizedQuery = this.normalizeText(query);
    const results = fuse.search(normalizedQuery);

    if (results.length === 0) {
      return messageErr.cannotReply;
    }

    return results[0].item.answer;
  }
}
