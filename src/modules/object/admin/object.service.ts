import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { ObjectAdminRepository } from './object.repository';
import { IObject } from '../object.interface';

@Injectable()
export class ObjectAdminService   {
  constructor(private readonly objectAdminRepository: ObjectAdminRepository) {
  }
  async getAll(dto: PagingDto): Promise<IList<IObject>> {
    const total = await this.objectAdminRepository.getTotal();
    const list = await this.objectAdminRepository.getAll(dto);
    return { total, list };
  }

}
