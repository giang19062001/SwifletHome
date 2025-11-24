import { Injectable } from '@nestjs/common';
import { IDoctor } from '../doctor.interface';
import { DoctorAdminRepository } from './doctor.repository';
import { IList } from 'src/interfaces/admin.interface';
import { PagingDto } from 'src/dto/admin.dto';
import { UpdateDoctorDto } from './doctor.dto';
import { LoggingService } from 'src/common/logger/logger.service';

@Injectable()
export class DoctorAdminService {
  private readonly SERVICE_NAME = 'DoctorAdminService';

  constructor(
    private readonly doctorAdminRepository: DoctorAdminRepository,
    private readonly logger: LoggingService,
  ) {}

  async getAll(dto: PagingDto): Promise<IList<IDoctor>> {
    const total = await this.doctorAdminRepository.getTotal();
    const list = await this.doctorAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(seq: number): Promise<IDoctor | null> {
    const doctor = await this.doctorAdminRepository.getDetail(seq);
    const doctorFiles = await this.doctorAdminRepository.getFilesBySeq(seq);
    if (!doctor) return null;

    const result: IDoctor = {
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
