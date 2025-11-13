import { Injectable } from '@nestjs/common';
import Fuse, { IFuseOptions } from 'fuse.js';
import { fuseConfig, ISearchItem } from 'src/config/fuse';
import { Msg } from 'src/helpers/message';

@Injectable()
export class SearchService {
  private readonly fuseOptions: IFuseOptions<ISearchItem> = fuseConfig;
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

  findAnswer(query: string, data: ISearchItem[]): string {
    if (!data?.length) {
      return Msg.DataEmpty;
    }

    // dữ liệu đã chuẩn hóa
    const normalizedData = data.map((item) => ({
      ...item,
      questions: item.questions.map((q) => this.normalizeText(q)),
    }));

    // Khởi tạo fuse với dữ liệu đã chuẩn hóa
    const fuse = new Fuse(normalizedData, this.fuseOptions);
    const normalizedQuery = this.normalizeText(query);

    // tìm kiếm...
    const results = fuse.search(normalizedQuery);

    // Nếu không tìm thấy kết quả phù hợp
    if (results.length === 0) {
      return Msg.CannotReply;
    }

    // Lấy kết quả phù hợp nhất
    return results[0].item.answer;
  }
}
