import { Injectable } from '@nestjs/common';
import { GetAdsBannerDto } from './ads.dto';
import { AdsAppRepository } from './ads.repository';

@Injectable()
export class AdsAppService {
  constructor(private readonly adsAppRepository: AdsAppRepository) {}

  async getBanners(dto: GetAdsBannerDto) {
    return await this.adsAppRepository.getBanners(dto);
  }
}
