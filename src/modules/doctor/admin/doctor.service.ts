import { Injectable } from '@nestjs/common';
import { IDoctor } from '../doctor.interface';
import { DoctorAdminRepository } from './doctor.repository';
import { IList } from 'src/interfaces/common';
import { PagingDto } from 'src/dto/common';
import { UpdateDoctorDto } from './doctor.dto';

@Injectable()
export class DoctorAdminService {
  constructor(private readonly doctorAdminRepository: DoctorAdminRepository) {}
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

  async updateDoctor(dto: UpdateDoctorDto, seq: number): Promise<number> {
    const result = await this.doctorAdminRepository.updateDoctor(dto, seq);
    return result;
  }
}
