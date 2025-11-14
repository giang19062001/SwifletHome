import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { ICategory } from './category.interface';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';
import { AbAdminService } from 'src/abstract/common';

@Injectable()
export class CategoryService extends AbAdminService {
  constructor(private readonly categoryRepository: CategoryRepository) {
    super();
  }
  async getAll(dto: PagingDto): Promise<IList<ICategory>> {
    const total = await this.categoryRepository.getTotal();
    const list = await this.categoryRepository.getAll(dto);
    return { total, list };
  }
  getDetail(dto: string | number): Promise<any | null> {
    throw new Error('Method not implemented.');
  }
  create(dto: any): Promise<number> {
    throw new Error('Method not implemented.');
  }
  update(dto: any, id: string | number): Promise<number> {
    throw new Error('Method not implemented.');
  }
  delete(dto: string | number): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
