import { Injectable } from '@nestjs/common';
import { GetAllGuestConsulationDto } from './guest.dto';
import { GuestAdminRepository } from './guest.repository';
import { GuestConsulationResDto } from './guest.response';

@Injectable()
export class GuestAdminService {
  private readonly SERVICE_NAME = 'GuestAdminService';

  constructor(private readonly guestAdminRepository: GuestAdminRepository) {}

  async getAll(dto: GetAllGuestConsulationDto): Promise<{ total: number; list: GuestConsulationResDto[] }> {
    const total = await this.guestAdminRepository.getTotal(dto);
    const list = await this.guestAdminRepository.getAll(dto);
    return { total, list };
  }
}
