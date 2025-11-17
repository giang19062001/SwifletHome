import { UploadService } from './../../upload/upload.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin';
import { IHome, IHomeImg } from '../home.interface';
import { HomeAppRepository } from './home.repository';
import { IListApp } from 'src/interfaces/app';

@Injectable()
export class HomeAppService {
  constructor(private readonly homeAppRepository: HomeAppRepository) {}
  async getAll(dto: PagingDto): Promise<IListApp<IHome>> {
    const total = await this.homeAppRepository.getTotal();
    const list = await this.homeAppRepository.getAll(dto);
    return { limit: dto.limit, page: dto.page, total, list };
  }
  async getDetail(homeCode: string): Promise<IHome | null> {
    const result = await this.homeAppRepository.getDetail(homeCode);
    return result;
  }
}
