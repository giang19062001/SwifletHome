import { Injectable } from '@nestjs/common';
import { OptionRepository } from './option.repository';
import { GetOptionDto } from './option.dto';
import { IOpition } from './option.interface';

@Injectable()
export class OptionService  {
  constructor(private readonly optionRepository: OptionRepository) {
  }
  async getAll(dto: GetOptionDto): Promise<IOpition[]> {
    const list = await this.optionRepository.getAll(dto);
    return list;
  }
}
