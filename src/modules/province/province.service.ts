import { Injectable } from '@nestjs/common';
import { ProvinceRepository } from './province.repository';
import { IProvince } from './province.interface';

@Injectable()
export class ProvinceService  {
  constructor(private readonly provinceRepository: ProvinceRepository) {
  }
  async getAll(): Promise<IProvince[]> {
    const list = await this.provinceRepository.getAll();
    return list;
  }
}
