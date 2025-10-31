import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';
import { HomeSubmitAdminRepository } from './homeSubmit.repository';
import { IHomeSubmit } from '../homeSubmit.interface';
import { UpdateStatusDto } from './homeSubmit.dto';

@Injectable()
export class HomeSubmitAdminService {
  constructor(private readonly homeSubmitAdminRepository: HomeSubmitAdminRepository) {}
  async getAll(dto: PagingDto): Promise<IList<IHomeSubmit>> {
    const total = await this.homeSubmitAdminRepository.getTotal();
    const list = await this.homeSubmitAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(seq: number): Promise<IHomeSubmit | null> {
    const result = await this.homeSubmitAdminRepository.getDetail(seq);
    return result
  }
  async updateStatus(dto: UpdateStatusDto, seq: number): Promise<number> {
    const result = await this.homeSubmitAdminRepository.updateStatus(dto, seq);
    return result
  }
}
