import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { PagingDto } from 'src/dto/admin.dto';
import { DoctorResDto } from "../doctor.response";
import { UpdateDoctorDto } from './doctor.dto';
import { DoctorAdminRepository } from './doctor.repository';

@Injectable()
export class DoctorAdminService {
  private readonly SERVICE_NAME = 'DoctorAdminService';

  constructor(
    private readonly doctorAdminRepository: DoctorAdminRepository,
    private readonly logger: LoggingService,
  ) {}

  async getAll(dto: PagingDto): Promise<{ total: number; list: DoctorResDto[] }> {
    const total = await this.doctorAdminRepository.getTotal();
    const list = await this.doctorAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(seq: number): Promise<DoctorResDto | null> {
    const doctor = await this.doctorAdminRepository.getDetail(seq);
    const doctorFiles = await this.doctorAdminRepository.getFilesBySeq(seq);
    if (!doctor) return null;

    const result: DoctorResDto = {
      ...doctor,
      doctorFiles,
    };
    return result;
  }

  async update(dto: UpdateDoctorDto, updatedId: string, seq: number): Promise<number> {
    const result = await this.doctorAdminRepository.update(dto, updatedId, seq);
    return result;
  }
}
