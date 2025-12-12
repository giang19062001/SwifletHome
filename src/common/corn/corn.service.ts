import { Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { FileLocalService } from '../fileLocal/fileLocal.service';
import { LoggingService } from '../logger/logger.service';
import { getFileLocation } from 'src/config/multer.config';
import path from 'path';
import { DoctorAppRepository } from 'src/modules/doctor/app/doctor.repository';
import { UserHomeAppRepository } from 'src/modules/userHome/app/userHome.repository';
import { TodoAppService } from 'src/modules/todo/app/todo.service';
import { SetTaskAlarmDto } from 'src/modules/todo/app/todo.dto';
import { TodoAppRepository } from 'src/modules/todo/app/todo.repository';
import moment from 'moment';
import { PeriodTypeEnum } from 'src/modules/todo/todo.interface';
import { FirebaseService } from '../firebase/firebase.service';
import { NotificationTypeEnum } from 'src/modules/notification/notification.interface';

@Injectable()
export class CornService implements OnModuleInit {
  private readonly SERVICE_NAME = 'CornService';

  constructor(
    private readonly doctorAppRepository: DoctorAppRepository,
    private readonly userHomeAppRepository: UserHomeAppRepository,
    private readonly todoAppService: TodoAppService,
    private readonly todoAppRepository: TodoAppRepository,
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
    });
    this.schedulerRegistry.addCronJob('dailyMidNightTask', jobDaily);
    jobDaily.start();

    // MONTHLY – ngày 01 mỗi tháng lúc 01:00
    const jobMonthly = new CronJob('0 1 1 * *', async () => {
      await this.insertTodoTaskAlarm(PeriodTypeEnum.MONTH);
    });
    this.schedulerRegistry.addCronJob('monthlyTask', jobMonthly);
    jobMonthly.start();

    // WEEKLY – Thứ Hai mỗi tuần lúc 01:00
    const jobWeekly = new CronJob('0 1 * * 1', async () => {
      await this.insertTodoTaskAlarm(PeriodTypeEnum.WEEK);
    });
    this.schedulerRegistry.addCronJob('weeklyTask', jobWeekly);
    jobWeekly.start();

    // DAILY: MỖI NGÀY LÚC 8H SÁNG
    const jobDailyAt8AM = new CronJob('0 8 * * *', async () => {
      await this.pushNotificationsByTaskAlarms();
    });

    this.schedulerRegistry.addCronJob('dailyMorningTask', jobDailyAt8AM);
    jobDailyAt8AM.start();
    // ! DEV
    // await this.pushNotificationsByTaskAlarms();
    // await this.insertTodoTaskAlarm(PeriodTypeEnum.MONTH);
    // await this.insertTodoTaskAlarm(PeriodTypeEnum.WEEK);
  }

  async pushNotificationsByTaskAlarms() {
    const logbase = `${this.SERVICE_NAME}/pushNotificationsByTaskAlarms`;

    // const todayStr = '2025-12-12'; // ! DEV
    const todayStr = moment.utc().format('YYYY-MM-DD'); // !PROD

    this.logger.log(logbase, `Chuẩn bị tìm các lịch nhắc hôm nay để gửi thông báo...`);

    const taskAlarmList = await this.todoAppRepository.getListTaskAlarmsToday(todayStr);
    this.logger.log(logbase, `Số lượng các lịch nhắc được thiết lập cho ngày hôm nay là: ${taskAlarmList.length}`);
    if (taskAlarmList.length) {
      for (const task of taskAlarmList) {
        // insert thông và đẩy thông báo
        await this.firebaseService.sendNotification(task.userCode, task.deviceToken, task.taskName, task.taskNote, { taskAlarmCode: task.taskAlarmCode }, NotificationTypeEnum.TODO);
      }
    }
  }

  async insertTodoTaskAlarm(periodType: PeriodTypeEnum) {
    const logbase = `${this.SERVICE_NAME}/insertTodoTaskAlarm`;
    this.logger.log(logbase, `Chuẩn bị tạo các lịch nhắc tự động dựa vào các thiết lập của chu kỳ ${periodType}...`);

    const taskPeriodList = await this.todoAppRepository.getListTaskPeriodType(periodType);

    this.logger.log(logbase, `Tổng các chu kỳ hiện có của ${periodType} là ${taskPeriodList.length}`);

    // lọc các alarm dựa vào chu kỳ -> nếu đã tồn tại bỏ qua
    let taskAlarmCanInsert: SetTaskAlarmDto[] = [];
    for (const periodDto of taskPeriodList) {
      const alramDto: SetTaskAlarmDto = await this.todoAppService.handleAlarmDataByPeriodData(periodDto, periodDto.taskPeriodCode);
      if (alramDto.taskDate == null) {
        this.logger.log(logbase, `Thời gian lịch nhắc không hợp lệ -> không thể thêm`);
      } else {
        const isDuplicateAlarm = await this.todoAppRepository.checkDuplicateTaskAlarm(periodDto.userCode, alramDto);
        if (isDuplicateAlarm) {
          this.logger.error(logbase, `Thời gian lịch nhắc (${moment(isDuplicateAlarm.taskDate).format('YYYY-MM-DD')}) của nhà yến (${alramDto.userHomeCode}) không thể thêm vì đã tồn tại `);
        } else {
          taskAlarmCanInsert.push({ ...alramDto, userCode: periodDto.userCode });
        }
      }
    }

    this.logger.log(logbase, `Tổng các lịch nhắc chuẩn bị thêm của ${periodType} là ${taskAlarmCanInsert.length}`);

    // insert các alarm đã được lọc trùng lặp
    for (const alramDto of taskAlarmCanInsert) {
      await this.todoAppRepository.insertTaskAlarm(alramDto.userCode ? alramDto.userCode : '', alramDto);
      this.logger.log(logbase, `Thêm lịch nhắc ${moment(alramDto.taskDate).format('YYYY-MM-DD')} cho nhà yến (${alramDto.userHomeCode}) thành công`);
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
