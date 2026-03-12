import { Injectable } from '@nestjs/common';
import { DoctorAdminRepository } from './doctor.repository';
import { PagingDto } from 'src/dto/admin.dto';
import { UpdateDoctorDto } from './doctor.dto';
import { LoggingService } from 'src/common/logger/logger.service';
import { ListResponseDto } from "src/dto/common.dto";
import { DoctorResDto } from "../doctor.response";

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
