import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { SaleHomeSightSeeingResDto } from '../saleHome.response';
import { UpdateStatusSightseeingDto } from './saleHome.dto';
import { SaleHomeSightseeingAdminRepository } from './saleHome-sightseeing.repository';

@Injectable()
export class SaleHomeSightseeingAdminService {
  constructor(
    private readonly saleHomeSightseeingAdminRepository: SaleHomeSightseeingAdminRepository,
  ) {}

  // TODO: SIGHTSEEING
  async getAllSightseeing(dto: PagingDto): Promise<{ total: number; list: SaleHomeSightSeeingResDto[] }> {
    const total = await this.saleHomeSightseeingAdminRepository.getTotalSightseeing();
    const list = await this.saleHomeSightseeingAdminRepository.getAllSightseeing(dto);
    return { total, list };
  }
  
  async getDetailSightseeing(seq: number): Promise<SaleHomeSightSeeingResDto | null> {
    const result = await this.saleHomeSightseeingAdminRepository.getDetailSightseeing(seq);
    return result;
  }
  
  async updateSightseeing(dto: UpdateStatusSightseeingDto, updatedId: string, seq: number): Promise<number> {
    const result = await this.saleHomeSightseeingAdminRepository.updateSightseeing(dto, updatedId, seq);
    return result;
  }
}
