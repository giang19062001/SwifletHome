import { Injectable } from '@nestjs/common';
import { CategoryAdminRepository } from './category.repository';
import { PagingDto } from 'src/dto/admin';
import { IList } from 'src/interfaces/admin';
import { AbAdminService } from 'src/abstract/admin.service';
import { ICategory } from '../category.interface';

@Injectable()
export class CategoryAdminService extends AbAdminService {
  constructor(private readonly categoryAdminRepository: CategoryAdminRepository) {
    super();
  }
  async getAll(dto: PagingDto): Promise<IList<ICategory>> {
    const total = await this.categoryAdminRepository.getTotal();
    const list = await this.categoryAdminRepository.getAll(dto);
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
