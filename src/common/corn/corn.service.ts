import { Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { FileLocalService } from '../fileLocal/fileLocal.service';
import { LoggingService } from '../logger/logger.service';
import path from 'path';
import { DoctorAppRepository } from 'src/modules/doctor/app/doctor.repository';
import { UserHomeAppRepository } from 'src/modules/userHome/app/userHome.repository';
import { TodoAppRepository } from 'src/modules/todo/app/todo.repository';
import moment from 'moment';
import { FirebaseService } from '../firebase/firebase.service';
import { NotificationTypeEnum } from 'src/modules/notification/notification.interface';
import { NOTIFICATIONS } from 'src/helpers/text.helper';
import { UserAppRepository } from 'src/modules/user/app/user.repository';
import TodoAppValidate from 'src/modules/todo/app/todo.validate';
import { QrAppRepository } from 'src/modules/qr/app/qr.repository';
import { TeamAppRepository } from 'src/modules/team/app/team.repository';

@Injectable()
export class CornService implements OnModuleInit {
  private readonly SERVICE_NAME = 'CornService';

  constructor(
    private readonly doctorAppRepository: DoctorAppRepository,
    private readonly teamAppRepository: TeamAppRepository,
    private readonly userAppRepository: UserAppRepository,
    private readonly userHomeAppRepository: UserHomeAppRepository,
    private readonly todoAppValidate: TodoAppValidate,
    private readonly todoAppRepository: TodoAppRepository,
    private readonly qrAppRepository: QrAppRepository,
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
  }

  async pushNotificationsByTaskAlarms() {
    const logbase = `${this.SERVICE_NAME}/pushNotificationsByTaskAlarms`;

    // const todayStr = '2025-12-24'; // ! DEV
    const todayStr = moment().format('YYYY-MM-DD'); // !PROD

    this.logger.log(logbase, `Chuẩn bị tìm các lịch nhắc hôm nay để gửi thông báo...`);

    const taskAlarmList = await this.todoAppRepository.getListTaskAlarmsToday(todayStr);
    this.logger.log(logbase, `Số lượng các lịch nhắc được thiết lập cho ngày hôm nay là: ${taskAlarmList.length}`);
    if (taskAlarmList.length) {
      for (const task of taskAlarmList) {
        // insert thông và đẩy thông báo
        const taskDay = moment(task.taskDate, 'YYYY-MM-DD');
        const daysLeft = taskDay.diff(todayStr, 'days');

        // lấy thông tin nhà
        const home = await this.userHomeAppRepository.getDetailHome(task.userHomeCode);
        const notify = NOTIFICATIONS.TODO_TASK_DAILY(home?.userHomeName ?? '', task.taskName, daysLeft);
        this.logger.log(logbase, `sẽ gửi thông báo: ${JSON.stringify(notify)} của taskDate(${task.taskDate}) với hôm nay(${todayStr}) của task(${task.taskAlarmCode}) cho user(${task.userCode})`);

        await this.firebaseService.sendNotification(task.userCode!!, task.deviceToken, notify.TITLE, notify.BODY, null, NotificationTypeEnum.TODO);
      }
    }
  }

  async deleteDoctorFilesNotUse() {
    const logbase = `${this.SERVICE_NAME}/deleteDoctorFilesNotUse`;
    this.logger.log(logbase, `Chuẩn bị xóa các file khám bệnh không dùng theo lịch trình....`);
    try {
      const filesNotUse = await this.doctorAppRepository.getFilesNotUse();
      if (filesNotUse.length) {
        for (const file of filesNotUse) {
          await this.doctorAppRepository.deleteFile(file.seq);
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
      const filesNotUse = await this.teamAppRepository.getFilesNotUse();
      if (filesNotUse.length) {
        for (const file of filesNotUse) {
          await this.teamAppRepository.deleteFile(file.seq);
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
      const filesNotUse = await this.userHomeAppRepository.getFilesNotUse();
      if (filesNotUse.length) {
        for (const file of filesNotUse) {
          await this.userHomeAppRepository.deleteFile(file.seq);
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
  async deleteQrRequestFilesNotUse() {
    const logbase = `${this.SERVICE_NAME}/deleteQrRequestFilesNotUse`;
    this.logger.log(logbase, `Chuẩn bị xóa các file video yêu cầu Qrcode dư thừa theo lịch trình....`);
    try {
      const filesNotUse = await this.qrAppRepository.getFilesNotUse();
      if (filesNotUse.length) {
        for (const file of filesNotUse) {
          await this.qrAppRepository.deleteFile(file.seq);
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
}
