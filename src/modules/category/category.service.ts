import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { ICategory } from './category.interface';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
  ) {}
  async getAll(
    dto: PagingDto,
  ): Promise<IList<ICategory>> {
    const total = await this.categoryRepository.getTotal();
    const list = await this.categoryRepository.getAll(dto);
    return { total, list };
  }
}
