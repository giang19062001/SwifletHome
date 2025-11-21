import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { ScreenAdminRepository } from './screen.repository';
import { IScreen } from '../screen.interface';
import { UpdateScreenDto } from './screen.dto';

@Injectable()
export class ScreenAdminService {
  constructor(private readonly screenAdminRepository: ScreenAdminRepository) {}
  async getAll(dto: PagingDto): Promise<IList<IScreen>> {
    const total = await this.screenAdminRepository.getTotal();
    const list = await this.screenAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(screenKeyword: string): Promise<IScreen | null> {
    const result = await this.screenAdminRepository.getDetail(screenKeyword);
    return result;
  }

  async update(dto: UpdateScreenDto, screenKeyword: string): Promise<number> {
    const result = await this.screenAdminRepository.update(dto, screenKeyword);
    return result;
  }
}
