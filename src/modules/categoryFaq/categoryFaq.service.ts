import { Injectable } from '@nestjs/common';
import { CateFaqRepository } from './categoryFaq.repository';
import { ICategoryFaq } from './categoryFaq.interface';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';

@Injectable()
export class CateFaqService {
  constructor(
    private readonly cateFaqRepository: CateFaqRepository,
  ) {}
  async getAll(
    dto: PagingDto,
  ): Promise<IList<ICategoryFaq>> {
    const total = await this.cateFaqRepository.getTotal();
    const list = await this.cateFaqRepository.getAll(dto);
    return { total, list };
  }
}
