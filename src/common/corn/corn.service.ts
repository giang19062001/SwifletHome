import { Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import moment from 'moment';
import { NOTIFICATIONS } from 'src/helpers/text.helper';
import { DoctorAppService } from 'src/modules/doctor/app/doctor.service';
import { NotificationTypeEnum } from 'src/modules/notification/notification.interface';
import { QrRequestAppService } from 'src/modules/qr/app/qr-request.service';
import { TeamReviewAppService } from 'src/modules/team/app/team-review.service';
import { TeamUserAppService } from 'src/modules/team/app/team-user.service';
import { TodoAlarmAppService } from 'src/modules/todo/app/todo-alarm.service';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { SaleHomeAppService } from 'src/modules/saleHome/app/saleHome.service';
import { FileLocalService } from '../fileLocal/fileLocal.service';
import { FirebaseService } from '../firebase/firebase.service';
import { LoggingService } from '../logger/logger.service';

@Injectable()
export class CornService implements OnModuleInit {
  private readonly SERVICE_NAME = 'CornService';

  constructor(
    private readonly doctorAppService: DoctorAppService,
    private readonly teamUserAppService: TeamUserAppService,
    private readonly teamReviewAppService: TeamReviewAppService,
    private readonly userHomeAppService: UserHomeAppService,
    private readonly saleHomeAppService: SaleHomeAppService,
    private readonly todoAlarmAppService: TodoAlarmAppService,
    private readonly qrRequestAppService: QrRequestAppService,
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
    // await this.deleteQrRequestFilesNotUse()
    //  await this.deleteDoctorFilesNotUse();
    // await this.deleteUserHomeFilesNotUse();
    // await this.pushNotificationsByTaskAlarms();
    // await this.insertTodoTaskAlarmByPeriod(PeriodTypeEnum.MONTH);
    // await this.insertTodoTaskAlarmByPeriod(PeriodTypeEnum.WEEK);
    // await this.deleteReviewFilesNotUse();
    // await this.deleteTeamFilesNotUse();
    // this.deleteSaleHomeFilesNotUse();
  }

  async pushNotificationsByTaskAlarms() {
    const logbase = `${this.SERVICE_NAME}/pushNotificationsByTaskAlarms`;

    // const todayStr = '2025-12-24'; // ! DEV
    const todayStr = moment().format('YYYY-MM-DD'); // !PROD

    this.logger.log(logbase, `Chuẩn bị tìm các lịch nhắc hôm nay để gửi thông báo...`);

    const taskAlarmList = await this.todoAlarmAppService.getListTaskAlarmsToday(todayStr);
    const taskMedicinesList = await this.todoAlarmAppService.getListTaskMedicinesToday(todayStr);

    const taskList = [...taskAlarmList, ...taskMedicinesList];

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

          return this.firebaseService.sendNotification(task.userCode!!, task.deviceToken, notify.TITLE, notify.BODY, null, NotificationTypeEnum.TODO);
        });

        // Đợi tất cả promises trong chunk xử lý xong, dù có success hay fail
        await Promise.allSettled(promises);
      }
    }
  }

  async deleteDoctorFilesNotUse() {
    const logbase = `${this.SERVICE_NAME}/deleteDoctorFilesNotUse`;
    this.logger.log(logbase, `Chuẩn bị xóa các file khám bệnh không dùng theo lịch trình....`);
    try {
      const filesNotUse = await this.doctorAppService.getFilesNotUse();
      if (filesNotUse.length) {
        for (const file of filesNotUse) {
          await this.doctorAppService.deleteFile(file.seq);
          await this.fileLocalService.deleteLocalFile(file.filename);
        }
        this.logger.log(logbase, `Các file khám bệnh không dùng đã được xóa theo lịch trình thành công`);
      } else {
        this.logger.log(logbase, `Không có file khám bệnh nào cần được xóa`);
      }
    } catch (error) {
      this.logger.error(logbase, `Có lỗi khi xóa các file khám bệnh không dùng theo lịch trình : ${JSON.stringify(error)}`);
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

      // 2. Xóa trong tbl_team_service_img
      const serviceFilesNotUse = await this.teamUserAppService.getFilesNotUseService();
      if (serviceFilesNotUse.length) {
        for (const file of serviceFilesNotUse) {
          await this.teamUserAppService.deleteFileService(file.seq);
          await this.fileLocalService.deleteLocalFile(file.filename);
        }
        this.logger.log(logbase, `Các file trong tbl_team_service_img không dùng đã được xóa thành công`);
      }

      if (!teamFilesNotUse.length && !serviceFilesNotUse.length) {
        this.logger.log(logbase, `Không có file đội gia công - đội kỹ thuật nào cần được xóa`);
      }
    } catch (error) {
      this.logger.error(logbase, `Có lỗi khi xóa các file đội gia công - đội kỹ thuật không dùng theo lịch trình : ${JSON.stringify(error)}`);
    }
  }
}
