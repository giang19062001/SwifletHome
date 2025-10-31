import { Injectable } from '@nestjs/common';
import { HomeSubmitAppRepository } from './homeSubmit.repository';
import { CreateHomeSubmitDto } from './homeSubmit.dto';

@Injectable()
export class HomeSubmitAppService {
  constructor(private readonly homeSubmitAppRepository: HomeSubmitAppRepository) {}
  async createHomeSubmit(dto: CreateHomeSubmitDto): Promise<number> {
    const result = await this.homeSubmitAppRepository.createHomeSubmit(dto);
    return result;
  }
}
