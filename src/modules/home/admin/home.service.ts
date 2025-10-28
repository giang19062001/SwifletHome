import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';
import { IHome } from '../home.interface';
import { HomeRepository } from './home.repository';

@Injectable()
export class HomeService {
  constructor(
    private readonly homeRepository: HomeRepository,
  ) {}
  async getAll(
    dto: PagingDto,
  ): Promise<IList<IHome>> {
    const total = await this.homeRepository.getTotal();
    const list = await this.homeRepository.getAll(dto);
    return { total, list };
  }
}
