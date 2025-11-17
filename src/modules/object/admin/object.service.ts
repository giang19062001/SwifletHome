import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin';
import { IList } from 'src/interfaces/admin';
import { AbAdminService } from 'src/abstract/admin.service';
import { ObjectAdminRepository } from './object.repository';
import { IObject } from '../object.interface';

@Injectable()
export class ObjectAdminService extends AbAdminService {
  constructor(private readonly objectAdminRepository: ObjectAdminRepository) {
    super();
  }
  async getAll(dto: PagingDto): Promise<IList<IObject>> {
    const total = await this.objectAdminRepository.getTotal();
    const list = await this.objectAdminRepository.getAll(dto);
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
