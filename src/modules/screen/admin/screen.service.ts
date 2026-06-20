import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { ScreenResDto } from "../screen.response";
import { UpdateScreenDto } from './screen.dto';
import { ScreenAdminRepository } from './screen.repository';

@Injectable()
export class ScreenAdminService {
  constructor(private readonly screenAdminRepository: ScreenAdminRepository) {}
  async getAll(dto: PagingDto): Promise<{ total: number; list: ScreenResDto[] }> {
    const total = await this.screenAdminRepository.getTotal();
    const list = await this.screenAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(screenKeyword: string): Promise<ScreenResDto | null> {
    const result = await this.screenAdminRepository.getDetail(screenKeyword);
    return result ?? null;
  }

  async update(dto: UpdateScreenDto, updatedId: string, screenKeyword: string): Promise<number> {
    const result = await this.screenAdminRepository.update(dto, updatedId, screenKeyword);
    return result;
  }
}
