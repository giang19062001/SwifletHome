import { Injectable } from '@nestjs/common';
import { IDoctor } from '../doctor.interface';
import { DoctorAdminRepository } from './doctor.repository';
import { IList } from 'src/interfaces/admin';
import { PagingDto } from 'src/dto/admin';
import { UpdateDoctorDto } from './doctor.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggingService } from 'src/common/logger/logger.service';
import { getFileLocation } from 'src/config/multer';
import path from 'path';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';

@Injectable()
export class DoctorAdminService {
  private readonly SERVICE_NAME = 'DoctorAdminService';

  constructor(
    private readonly doctorAdminRepository: DoctorAdminRepository,
    private readonly fileLocalService: FileLocalService,
    private readonly logger: LoggingService,
  ) {}
  // 2 giờ sáng mỗi ngày
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async deleteFilesNotUse() {
    const logbase = `${this.SERVICE_NAME}/deleteFilesNotUse`;
    this.logger.log(logbase, `Chuẩn bị xóa các file khám bệnh không dùng theo lịch trình....`);
    try {
      const filesNotUse = await this.doctorAdminRepository.getFilesNotUse();
      if (filesNotUse.length) {
        for (const file of filesNotUse) {
          // xóa trong db
          await this.doctorAdminRepository.deleteFile(file.seq);
          // xóa file trong uploads
          const location = getFileLocation(file.mimetype, file.filename);
          await this.fileLocalService.deleteLocalFile(`${path.join(location, file.filename)}`);
        }
        this.logger.log(logbase, `Các file khám bệnh  không dùng dã được xóa theo lịch trình thành công`);
      } else {
        this.logger.log(logbase, `Không có file  khám bệnh nào cần được xóa`);
      }
    } catch (error) {
      this.logger.error(logbase, 'Có lỗi khi xóa các file khám bệnh không dùng theo lịch trình');
    }
  }
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

  async update(dto: UpdateDoctorDto, seq: number): Promise<number> {
    const result = await this.doctorAdminRepository.update(dto, seq);
    return result;
  }
}
