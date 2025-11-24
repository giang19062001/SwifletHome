import { Injectable } from '@nestjs/common';
import { CategoryAdminRepository } from './category.repository';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { ICategory } from '../category.interface';

@Injectable()
export class CategoryAdminService   {
  constructor(private readonly categoryAdminRepository: CategoryAdminRepository) {
  }
  async getAll(dto: PagingDto): Promise<IList<ICategory>> {
    const total = await this.categoryAdminRepository.getTotal();
    const list = await this.categoryAdminRepository.getAll(dto);
    return { total, list };
  }
}
