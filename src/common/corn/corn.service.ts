import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import * as fs from 'fs';
import moment from 'moment';
import type { Pool } from 'mysql2/promise';
import * as path from 'path';
import { NOTIFICATIONS } from 'src/helpers/text.helper';
import { AdsAdminService } from 'src/modules/ads/admin/ads.service';
import { DoctorAppService } from 'src/modules/doctor/app/doctor.service';
import { NotificationTypeEnum } from 'src/modules/notification/common/notification.enum';
import { QrRequestAppService } from 'src/modules/qr/app/qr-request.service';
import { SaleHomeAppService } from 'src/modules/saleHome/app/saleHome.service';
import { TeamReviewAppService } from 'src/modules/team/app/team-review.service';
import { TeamUserAppService } from 'src/modules/team/app/team-user.service';
import { TodoAlarmAppService } from 'src/modules/todo/app/todo-alarm.service';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { FileLocalService } from '../fileLocal/fileLocal.service';
import { FirebaseService } from '../firebase/firebase.service';
import { LoggingService } from '../logger/logger.service';
import { TABLE_MAPPING_TO_JOB_CLEAR } from './corn.const';

@Injectable()
export class CornService implements OnModuleInit {
  private readonly SERVICE_NAME = 'CornService';

  constructor(
    @Inject('MYSQL_CONNECTION') private readonly db: Pool,
    private readonly doctorAppService: DoctorAppService,
    private readonly teamUserAppService: TeamUserAppService,
    private readonly teamReviewAppService: TeamReviewAppService,
    private readonly userHomeAppService: UserHomeAppService,
    private readonly saleHomeAppService: SaleHomeAppService,
    private readonly todoAlarmAppService: TodoAlarmAppService,
    private readonly qrRequestAppService: QrRequestAppService,
    private readonly adsAdminService: AdsAdminService,
    private readonly fileLocalService: FileLocalService,
    private readonly firebaseService: FirebaseService,
    private readonly logger: LoggingService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit() {
    // DAILY – mỗi ngày lúc 01:00 KHUYA
    const jobDaily = new CronJob('0 1 * * *', async () => {
      await this.deleteDoctorFilesNotUse();
      await this.deleteUserHomeFilesNotUse();
      await this.deleteQrRequestFilesNotUse();
      await this.deleteReviewFilesNotUse();
      await this.deleteTeamFilesNotUse();
      await this.deleteSaleHomeFilesNotUse();
      await this.deleteAdsFilesNotUse();
      await this.deleteOrphanedLocalFiles();
    });
    this.schedulerRegistry.addCronJob('dailyMidNightTask', jobDaily);
    jobDaily.start();

    // MONTHLY – ngày 01 mỗi tháng lúc 01:00
    // const jobMonthly = new CronJob('0 1 1 * *', async () => {
    //   await this.insertTodoTaskAlarmByPeriod(PeriodTypeEnum.MONTH);
    // });
    // this.schedulerRegistry.addCronJob('monthlyTask', jobMonthly);
    // jobMonthly.start();

    // WEEKLY – Thứ Hai mỗi tuần lúc 01:00
    // const jobWeekly = new CronJob('0 1 * * 1', async () => {
    //   await this.insertTodoTaskAlarmByPeriod(PeriodTypeEnum.WEEK);
    // });
    // this.schedulerRegistry.addCronJob('weeklyTask', jobWeekly);
    // jobWeekly.start();

    // DAILY: MỖI NGÀY LÚC 8H SÁNG
    const jobDailyAt8AM = new CronJob('0 8 * * *', async () => {
      await this.pushNotificationsByTaskAlarms();
    });

    this.schedulerRegistry.addCronJob('dailyMorningTask', jobDailyAt8AM);
    jobDailyAt8AM.start();
    // ! test
    // await this.deleteAdsFilesNotUse();
    // await this.deleteQrRequestFilesNotUse();
    // await this.deleteDoctorFilesNotUse();
    // await this.deleteUserHomeFilesNotUse();
    // await this.pushNotificationsByTaskAlarms();
    // await this.deleteReviewFilesNotUse();
    // await this.deleteTeamFilesNotUse();
    // await this.deleteSaleHomeFilesNotUse();
    // await this.deleteOrphanedLocalFiles();
  }

  async pushNotificationsByTaskAlarms() {
    const logbase = `${this.SERVICE_NAME}/pushNotificationsByTaskAlarms`;

    // const todayStr = '2025-12-24'; // ! DEV
    const todayStr = moment().format('YYYY-MM-DD'); // !PROD

    this.logger.log(logbase, `Chuẩn bị tìm các lịch nhắc hôm nay để gửi thông báo...`);

    const taskAlarmList = await this.todoAlarmAppService.getListTaskAlarmsToday(todayStr);
    const taskMedicinesList = await this.todoAlarmAppService.getListTaskMedicinesToday(todayStr);
    const taskHarvestList = await this.todoAlarmAppService.getListTaskHarvertToday(todayStr);

    const taskList = [...taskAlarmList, ...taskMedicinesList, ...taskHarvestList];

    this.logger.log(logbase, `Số lượng các lịch nhắc được thiết lập cho ngày hôm nay là: ${taskList.length}`);

    if (taskList.length) {
      const CHUNK_SIZE = 50; // Xử lý mỗi 50 task một lúc để tránh thắt cổ chai

      for (let i = 0; i < taskList.length; i += CHUNK_SIZE) {
        const chunk = taskList.slice(i, i + CHUNK_SIZE);

        const promises = chunk.map(async (task) => {
          // insert thông và đẩy thông báo
          const taskDay = moment(task.taskDate, 'YYYY-MM-DD');
          const daysLeft = taskDay.diff(todayStr, 'days');
          const notify = NOTIFICATIONS.TODO_TASK_DAILY(task.userHomeName ?? '', task.taskName, daysLeft);

          this.logger.log(logbase, `sẽ gửi thông báo: ${JSON.stringify(notify)} của taskDate(${task.taskDate}) với hôm nay(${todayStr}) của task(${task.seq}) cho user(${task.userCode})`);

          return this.firebaseService.sendNotification(task.userCode!, task.deviceToken, notify.TITLE, notify.BODY, null, NotificationTypeEnum.TODO);
        });

        // Đợi tất cả promises trong chunk xử lý xong, dù có success hay fail
        await Promise.allSettled(promises);
      }
    }
  }

  async deleteDoctorFilesNotUse() {
    const logbase = `${this.SERVICE_NAME}/deleteDoctorFilesNotUse`;
    this.logger.log(logbase, `Chuẩn bị xóa các file tăng đàn không dùng theo lịch trình....`);
    try {
      const filesNotUse = await this.doctorAppService.getFilesNotUse();
      if (filesNotUse.length) {
        for (const file of filesNotUse) {
          await this.doctorAppService.deleteFile(file.seq);
          await this.fileLocalService.deleteLocalFile(file.filename);
        }
        this.logger.log(logbase, `Các file tăng đàn  không dùng đã được xóa theo lịch trình thành công`);
      } else {
        this.logger.log(logbase, `Không có file tăng đàn  nào cần được xóa`);
      }
    } catch (error) {
      this.logger.error(logbase, `Có lỗi khi xóa các file tăng đàn  không dùng theo lịch trình : ${JSON.stringify(error)}`);
    }
  }

  async deleteReviewFilesNotUse() {
    const logbase = `${this.SERVICE_NAME}/deleteReviewFilesNotUse`;
    this.logger.log(logbase, `Chuẩn bị xóa các file review không dùng theo lịch trình....`);
    try {
      const filesNotUse = await this.teamReviewAppService.getFilesNotUse();
      if (filesNotUse.length) {
        for (const file of filesNotUse) {
          await this.teamReviewAppService.deleteFile(file.seq);
          await this.fileLocalService.deleteLocalFile(file.filename);
        }
        this.logger.log(logbase, `Các file review không dùng đã được xóa theo lịch trình thành công`);
      } else {
        this.logger.log(logbase, `Không có file review nào cần được xóa`);
      }
    } catch (error) {
      this.logger.error(logbase, `Có lỗi khi xóa các file review không dùng theo lịch trình : ${JSON.stringify(error)}`);
    }
  }

  async deleteUserHomeFilesNotUse() {
    const logbase = `${this.SERVICE_NAME}/deleteUserHomeFilesNotUse`;
    this.logger.log(logbase, `Chuẩn bị xóa các file ảnh nhà yến của khách hàng không dùng theo lịch trình....`);
    try {
      const filesNotUse = await this.userHomeAppService.getFilesNotUse();
      if (filesNotUse.length) {
        for (const file of filesNotUse) {
          await this.userHomeAppService.deleteFile(file.seq);
          await this.fileLocalService.deleteLocalFile(file.filename);
        }
        this.logger.log(logbase, `Các file ảnh nhà yến của khách hàng  không dùng đã được xóa theo lịch trình thành công`);
      } else {
        this.logger.log(logbase, `Không có file ảnh nhà yến của khách hàng nào cần được xóa`);
      }
    } catch (error) {
      this.logger.error(logbase, `Có lỗi khi xóa các file  ảnh nhà yến của khách hàng không dùng theo lịch trình: ${JSON.stringify(error)}`);
    }
  }

  async deleteSaleHomeFilesNotUse() {
    const logbase = `${this.SERVICE_NAME}/deleteSaleHomeFilesNotUse`;
    this.logger.log(logbase, `Chuẩn bị xóa các file nhà yến sale không dùng theo lịch trình....`);
    try {
      const filesNotUse = await this.saleHomeAppService.getFilesNotUse();
      if (filesNotUse.length) {
        for (const file of filesNotUse) {
          await this.saleHomeAppService.deleteFileCron(file.seq);
          await this.fileLocalService.deleteLocalFile(file.filename);
        }
        this.logger.log(logbase, `Các file nhà yến sale không dùng đã được xóa theo lịch trình thành công`);
      } else {
        this.logger.log(logbase, `Không có file nhà yến sale nào cần được xóa`);
      }
    } catch (error) {
      this.logger.error(logbase, `Có lỗi khi xóa các file nhà yến sale không dùng theo lịch trình: ${JSON.stringify(error)}`);
    }
  }

  async deleteQrRequestFilesNotUse() {
    const logbase = `${this.SERVICE_NAME}/deleteQrRequestFilesNotUse`;
    this.logger.log(logbase, `Chuẩn bị xóa các file video yêu cầu Qrcode dư thừa theo lịch trình....`);
    try {
      const filesNotUse = await this.qrRequestAppService.getFilesNotUse();
      if (filesNotUse.length) {
        for (const file of filesNotUse) {
          await this.qrRequestAppService.deleteFile(file.seq);
          await this.fileLocalService.deleteLocalFile(file.filename);
        }
        this.logger.log(logbase, `Các file video yêu cầu Qrcode dư thừa đã được xóa theo lịch trình thành công`);
      } else {
        this.logger.log(logbase, `Không có file video yêu cầu Qrcode dư thừa nào cần được xóa`);
      }
    } catch (error) {
      this.logger.error(logbase, `Có lỗi khi xóa file video yêu cầu Qrcode dư thừa theo lịch trình: ${JSON.stringify(error)}`);
    }
  }

  async deleteTeamFilesNotUse() {
    const logbase = `${this.SERVICE_NAME}/deleteTeamFilesNotUse`;
    this.logger.log(logbase, `Chuẩn bị xóa các file đội gia công - đội kỹ thuật không dùng theo lịch trình....`);
    try {
      // 1. Xóa trong tbl_team_img
      const teamFilesNotUse = await this.teamUserAppService.getFilesNotUseTeam();
      if (teamFilesNotUse.length) {
        for (const file of teamFilesNotUse) {
          await this.teamUserAppService.deleteFileTeam(file.seq);
          await this.fileLocalService.deleteLocalFile(file.filename);
        }
        this.logger.log(logbase, `Các file trong tbl_team_img không dùng đã được xóa thành công`);
      }

      // 2. Xóa trong tbl_team_service_file
      const serviceFilesNotUse = await this.teamUserAppService.getFilesNotUseService();
      if (serviceFilesNotUse.length) {
        for (const file of serviceFilesNotUse) {
          await this.teamUserAppService.deleteFileService(file.seq);
          await this.fileLocalService.deleteLocalFile(file.filename);
        }
        this.logger.log(logbase, `Các file trong tbl_team_service_file không dùng đã được xóa thành công`);
      }

      if (!teamFilesNotUse.length && !serviceFilesNotUse.length) {
        this.logger.log(logbase, `Không có file đội gia công - đội kỹ thuật nào cần được xóa`);
      }
    } catch (error) {
      this.logger.error(logbase, `Có lỗi khi xóa các file đội gia công - đội kỹ thuật không dùng theo lịch trình : ${JSON.stringify(error)}`);
    }
  }

  async deleteAdsFilesNotUse() {
    const logbase = `${this.SERVICE_NAME}/deleteAdsFilesNotUse`;
    this.logger.log(logbase, `Chuẩn bị xóa các file ads banner không dùng theo lịch trình....`);
    try {
      const filesNotUse = await this.adsAdminService.getFilesNotUse();
      if (filesNotUse.length) {
        for (const file of filesNotUse) {
          await this.adsAdminService.deleteFile(file.seq);
          await this.fileLocalService.deleteLocalFile(file.filename);
        }
        this.logger.log(logbase, `Các file ads banner không dùng đã được xóa theo lịch trình thành công`);
      } else {
        this.logger.log(logbase, `Không có file ads banner nào cần được xóa`);
      }
    } catch (error) {
      this.logger.error(logbase, `Có lỗi khi xóa file ads banner không dùng theo lịch trình: ${JSON.stringify(error)}`);
    }
  }
  async deleteOrphanedLocalFiles() {
    const logbase = `${this.SERVICE_NAME}/deleteOrphanedLocalFiles`;
    this.logger.log(logbase, `Bắt đầu tiến trình quét file rác...`);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      this.logger.log(logbase, `Thư mục public/uploads không tồn tại, bỏ qua.`);
      return;
    }

    const IGNORED_PATHS = ['images/configs', 'images/screens'];
    const localFilesSet = new Set<string>();

    // Quét đệ quy lấy toàn bộ file trên ổ cứng vào Set
    const walkDir = async (dir: string) => {
      const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const dirent of dirents) {
        const absolutePath = path.join(dir, dirent.name);
        const relativePath = path.relative(path.join(process.cwd(), 'public'), absolutePath).replace(/\\/g, '/');

        // Bỏ qua thư mục/file rác nằm trong danh sách cấm
        if (dirent.name.startsWith('.') || IGNORED_PATHS.some((ignored) => relativePath.includes(ignored))) {
          continue;
        }

        if (dirent.isDirectory()) {
          await walkDir(absolutePath);
        } else {
          // Thêm file vào Set
          localFilesSet.add(relativePath);
        }
      }
    };

    try {
      await walkDir(uploadsDir);
      this.logger.log(logbase, `Đã quét được ${localFilesSet.size} files trên ổ cứng.`);

      if (localFilesSet.size === 0) return;

      // Danh sách tất cả các bảng và cột chứa đường dẫn file

      // Truy vấn DB lấy toàn bộ path đang được sử dụng và loại bỏ khỏi Set
      for (const mapping of TABLE_MAPPING_TO_JOB_CLEAR) {
        const sql = ` SELECT ${mapping.column} AS filepath FROM ${mapping.table} WHERE ${mapping.column} LIKE 'uploads/%'`;
        try {
          const [rows]: any = await this.db.execute(sql);
          if (rows && rows.length > 0) {
            for (const row of rows) {
              if (row.filepath) {
                // Xóa khỏi Set vì file này đang được DB sử dụng (không phải rác)
                localFilesSet.delete(row.filepath);
              }
            }
          }
        } catch (err) {
          this.logger.error(logbase, `Lỗi khi lấy dữ liệu từ bảng ${mapping.table}: ${JSON.stringify(err)}`);
        }
      }

      // Các file còn lại trong Set chính là file rác (cần xóa)
      const orphanedFiles = Array.from(localFilesSet);
      this.logger.log(logbase, `Phát hiện ${orphanedFiles.length} file rác không có trong DB.`);

      if (orphanedFiles.length === 0) {
        this.logger.log(logbase, `Không có file rác nào cần dọn dẹp`);
        return;
      }

      //  Xóa hàng loạt theo chunk (50 file mỗi lượt)
      let deletedCount = 0;
      const CHUNK_SIZE = 50;

      for (let i = 0; i < orphanedFiles.length; i += CHUNK_SIZE) {
        const chunk = orphanedFiles.slice(i, i + CHUNK_SIZE);

        await Promise.allSettled(
          chunk.map(async (relativePath) => {
            const absolutePath = path.join(process.cwd(), 'public', relativePath);
            try {
              await fs.promises.unlink(absolutePath);
              this.logger.log(logbase, `Đã xóa: ${relativePath} dựa vào bảng ${TABLE_MAPPING_TO_JOB_CLEAR.map((m) => m.table).join(', ')}`);
              deletedCount++;
            } catch (err) {
              this.logger.error(logbase, `Không thể xóa file ${relativePath}: ${JSON.stringify(err)}`);
            }
          }),
        );
      }
      this.logger.log(logbase, `Hoàn tất dọn rác local. Đã xử lý ${deletedCount} file rác.`);
    } catch (error) {
      this.logger.error(logbase, `Lỗi trong quá trình quét đệ quy file rác: ${JSON.stringify(error)}`);
    }
  }
}
