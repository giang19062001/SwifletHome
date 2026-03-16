import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { CategoryResDto } from "../category.response";
import { CategoryAdminRepository } from './category.repository';

@Injectable()
export class CategoryAdminService   {
  constructor(private readonly categoryAdminRepository: CategoryAdminRepository) {
  }
  async getAll(dto: PagingDto): Promise<{ total: number; list: CategoryResDto[] }> {
    const total = await this.categoryAdminRepository.getTotal();
    const list = await this.categoryAdminRepository.getAll(dto);
    return { total, list };
  }
}
