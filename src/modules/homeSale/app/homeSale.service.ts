import { UploadService } from '../../upload/upload.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin';
import { IHomeSale, IHomeSaleImg } from '../homeSale.interface';
import { HomeSaleAppRepository } from './homeSale.repository';
import { IListApp } from 'src/interfaces/app';

@Injectable()
export class HomeSaleAppService {
  constructor(private readonly homeAppRepository: HomeSaleAppRepository) {}
  async getAll(dto: PagingDto): Promise<IListApp<IHomeSale>> {
    const total = await this.homeAppRepository.getTotal();
    const list = await this.homeAppRepository.getAll(dto);
    return { limit: dto.limit, page: dto.page, total, list };
  }
  async getDetail(homeCode: string): Promise<IHomeSale | null> {
    const result = await this.homeAppRepository.getDetail(homeCode);
    return result;
  }
}
