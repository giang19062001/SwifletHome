import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin';
import { IList } from 'src/interfaces/admin';
import { AbAdminService } from 'src/abstract/admin.service';
import { ScreenAdminRepository } from './screen.repository';
import { IScreen } from '../screen.interface';
import { UpdateScreenDto } from './screen.dto';

@Injectable()
export class ScreenAdminService extends AbAdminService {
  constructor(private readonly screenAdminRepository: ScreenAdminRepository) {
    super();
  }
  async getAll(dto: PagingDto): Promise<IList<IScreen>> {
    const total = await this.screenAdminRepository.getTotal();
    const list = await this.screenAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(screenKeyword: string): Promise<IScreen | null> {
    const result = await this.screenAdminRepository.getDetail(screenKeyword);
    return result;
  }
  create(dto: any): Promise<number> {
    throw new Error('Method not implemented.');
  }
  async update(dto: UpdateScreenDto, screenKeyword: string): Promise<number> {
    const result = await this.screenAdminRepository.update(dto, screenKeyword);
    return result;
  }
  delete(dto: string | number): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
