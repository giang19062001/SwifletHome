import { Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { DoctorAdminRepository } from 'src/modules/doctor/admin/doctor.repository';
import { FileLocalService } from '../fileLocal/fileLocal.service';
import { LoggingService } from '../logger/logger.service';
import { getFileLocation } from 'src/config/multer.config';
import path from 'path';

@Injectable()
export class CornService implements OnModuleInit {
  private readonly SERVICE_NAME = 'CornService';

  constructor(
    private readonly doctorAdminRepository: DoctorAdminRepository,
    private readonly fileLocalService: FileLocalService,
    private readonly logger: LoggingService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    // chạy mỗi 1h sáng
    const job = new CronJob('0 1 * * *', () => {
      this.deleteFilesNotUse();
    });

    this.schedulerRegistry.addCronJob('deleteFilesNotUse', job);
    job.start();
  }

  async deleteFilesNotUse() {
    const logbase = `${this.SERVICE_NAME}/deleteFilesNotUse`;
    this.logger.log(logbase, `Chuẩn bị xóa các file khám bệnh không dùng theo lịch trình....`);
    try {
      const filesNotUse = await this.doctorAdminRepository.getFilesNotUse();
      if (filesNotUse.length) {
        for (const file of filesNotUse) {
          await this.doctorAdminRepository.deleteFile(file.seq);
          const location = getFileLocation(file.mimetype, file.filename);
          await this.fileLocalService.deleteLocalFile(`${path.join(location, file.filename)}`);
        }
        this.logger.log(logbase, `Các file khám bệnh không dùng đã được xóa theo lịch trình thành công`);
      } else {
        this.logger.log(logbase, `Không có file khám bệnh nào cần được xóa`);
      }
    } catch (error) {
      this.logger.error(logbase, 'Có lỗi khi xóa các file khám bệnh không dùng theo lịch trình');
    }
  }
}