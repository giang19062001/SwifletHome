import { Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { FileLocalService } from '../fileLocal/fileLocal.service';
import { LoggingService } from '../logger/logger.service';
import { getFileLocation } from 'src/config/multer.config';
import path from 'path';
import { DoctorAppRepository } from 'src/modules/doctor/app/doctor.repository';
import { UserHomeAppRepository } from 'src/modules/userHome/app/userHome.repository';

@Injectable()
export class CornService implements OnModuleInit {
  private readonly SERVICE_NAME = 'CornService';

  constructor(
    private readonly doctorAppRepository: DoctorAppRepository,
    private readonly userHomeAppRepository: UserHomeAppRepository,
    private readonly fileLocalService: FileLocalService,
    private readonly logger: LoggingService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    // chạy mỗi 1h sáng
    // const job = new CronJob('0 1 * * *', () => {
    //   this.deleteDoctorFilesNotUse();
    // });
    const job = new CronJob('0 54 8 * * *', () => {
      this.deleteDoctorFilesNotUse();
    });

    this.schedulerRegistry.addCronJob('deleteFilesNotUse', job);
    job.start();
  }

  async deleteDoctorFilesNotUse() {
    const logbase = `${this.SERVICE_NAME}/deleteDoctorFilesNotUse`;
    this.logger.log(logbase, `Chuẩn bị xóa các file khám bệnh không dùng theo lịch trình....`);
    try {
      const filesNotUse = await this.doctorAppRepository.getFilesNotUse();
      if (filesNotUse.length) {
        for (const file of filesNotUse) {
          await this.doctorAppRepository.deleteFile(file.seq);
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
  async deleteUserHomeFilesNotUse() {
    const logbase = `${this.SERVICE_NAME}/deleteUserHomeFilesNotUse`;
    this.logger.log(logbase, `Chuẩn bị xóa các file ảnh nhà yến của khách hàng không dùng theo lịch trình....`);
    try {
      const filesNotUse = await this.userHomeAppRepository.getFilesNotUse();
      if (filesNotUse.length) {
        for (const file of filesNotUse) {
          await this.userHomeAppRepository.deleteFile(file.seq);
          const location = getFileLocation(file.mimetype, file.filename);
          await this.fileLocalService.deleteLocalFile(`${path.join(location, file.filename)}`);
        }
        this.logger.log(logbase, `Các file ảnh nhà yến của khách hàng  không dùng đã được xóa theo lịch trình thành công`);
      } else {
        this.logger.log(logbase, `Không có file ảnh nhà yến của khách hàng nào cần được xóa`);
      }
    } catch (error) {
      this.logger.error(logbase, 'Có lỗi khi xóa các file  ảnh nhà yến của khách hàng không dùng theo lịch trình');
    }
  }
}
