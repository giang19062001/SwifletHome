import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { ObjectAdminRepository } from './object.repository';
import { ListResponseDto } from "src/dto/common.dto";
import { ObjectResDto } from "../object.response";

@Injectable()
export class ObjectAdminService   {
  constructor(private readonly objectAdminRepository: ObjectAdminRepository) {
  }
  async getAll(dto: PagingDto): Promise<{ total: number; list: ObjectResDto[] }> {
    const total = await this.objectAdminRepository.getTotal();
    const list = await this.objectAdminRepository.getAll(dto);
    return { total, list };
  }

}
