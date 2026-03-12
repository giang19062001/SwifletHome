import { Injectable } from '@nestjs/common';
import { CategoryAdminRepository } from './category.repository';
import { PagingDto } from 'src/dto/admin.dto';
import { ListResponseDto } from "src/dto/common.dto";
import { CategoryResDto } from "../category.response";

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
