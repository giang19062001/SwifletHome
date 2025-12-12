import { Injectable } from '@nestjs/common';
import { ITodoHomeTaskAlram, ITodoHomeTaskPeriod, ITodoTask, TaskStatusEnum } from '../todo.interface';
import { TodoAppRepository } from './todo.repository';
import { LoggingService } from 'src/common/logger/logger.service';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { SetTaskAlarmDto, SetTaskPeriodDto } from './todo.dto';
import { Msg } from 'src/helpers/message.helper';
import { PagingDto } from 'src/dto/admin.dto';
import { IListApp } from 'src/interfaces/app.interface';
import moment from 'moment';

@Injectable()
export class TodoAppService {
  private readonly SERVICE_NAME = 'TodoAppService';

  constructor(
    private readonly todoAppRepository: TodoAppRepository,
    private readonly userHomeAppService: UserHomeAppService,
    private readonly logger: LoggingService,
  ) {}

  // TODO: BOX-TASK
  async getScheduledTasks(userCode: string, userHomeCode: string): Promise<{ [key: string]: string }[]> {
    const logbase = `${this.SERVICE_NAME}/getScheduledTasks:`;

    const home = await this.userHomeAppService.getDetail(userHomeCode);
    const boxTasks = await this.todoAppRepository.getBoxTasks();

    // nếu nhà yến chính có
    if (!home) return [];
    if (!boxTasks.length) return [];

    const today = moment().startOf('day'); // ! PROD
    // const today = moment('2025-12-13') // ! DEV

    const result = await Promise.all(
      boxTasks.map(async (ele) => {
        const data = await this.todoAppRepository.getOneTaskAlarmsNearly(userCode, userHomeCode, ele.taskCode, ele.taskName, today.format('YYYY-MM-DD'));

        this.logger.log(logbase, `taskDate of (userCode:${userCode}, userHomeCode:${userHomeCode}, taskCode:${ele.taskCode}, taskName:${ele.taskName}) --> ${data?.taskDate}`);

        if (!data || !data.taskDate) {
          return {
            label: ele.taskName,
            value: 'NaN',
            date: '',
          };
        }

        const taskDate = moment(data.taskDate);

        const diff = taskDate.diff(today, 'days');

        return {
          label: ele.taskName,
          value: diff.toString(), // số ngày còn lại
          date: taskDate.format('YYYY-MM-DD'),
        };
      }),
    );

    return result;
  }
  // TODO: TASK
  async getTasks(): Promise<ITodoTask[]> {
    const logbase = `${this.SERVICE_NAME}/getTasks:`;
    const list = await this.todoAppRepository.getTasks();
    this.logger.log(logbase, `list.length(${list.length})`);

    return list;
  }

  // TODO: ALARM
  async getListTaskAlarms(userCode: string, userHomeCode: string, dto: PagingDto): Promise<IListApp<ITodoHomeTaskAlram>> {
    const logbase = `${this.SERVICE_NAME}/getTaskAlarms:`;

    const total = await this.todoAppRepository.getTotalTaskAlarm(userCode, userHomeCode);
    const list = await this.todoAppRepository.getListTaskAlarms(userCode, userHomeCode, dto);

    return { total, list };
  }

  async changeTaskAlarmStatus(taskStatus: TaskStatusEnum, userCode: string, taskAlarmCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/changeTaskAlarmStatus:`;
    const result = await this.todoAppRepository.changeTaskAlarmStatus(taskStatus, userCode, taskAlarmCode);
    this.logger.log(logbase, `cập nhập trạng thái của lịch nhắc thành (${taskStatus})`);
    return result;
  }
  // TODO: PERIOD

  // TODO: PERIOD + ALARM
  async handleAlarmDataByPeriodData(dto: SetTaskPeriodDto, taskPeriodCode: string): Promise<SetTaskAlarmDto> {
    const logbase = `${this.SERVICE_NAME}/handleAlarmDataByPeriodData:`;

    let alramDto: SetTaskAlarmDto = {
      taskPeriodCode: taskPeriodCode,
      userHomeCode: dto.userHomeCode,
      taskName: '',
      taskNote: dto.taskNote,
      taskDate: new Date(),
      taskStatus: TaskStatusEnum.WAITING,
    };

    // gán giá trị taskName vào alarm DTO
    if (dto.isCustomTask == 'Y') {
      alramDto.taskName = dto.taskCustomName;
    }
    if (dto.isCustomTask == 'N' && dto.taskCode != null) {
      {
        // lấy taskName từ CSDL dựa vào taskCode
        const task = await this.todoAppRepository.getDetailTask(dto.taskCode);
        if (task) {
          alramDto.taskName = task.taskName;
        }
      }
    }
    // gán giá trị taskDate vào alarm DTO cho ngày cụ thể
    if (dto.isPeriod == 'N' && dto.specificValue != null) {
      alramDto.taskDate = dto.specificValue;
    }

    // const today = moment('2026-02-02'); // ! DEV
    const today = moment(); // ! PROD

    // gán giá trị taskDate vào alarm DTO cho chu kỳ ngày trong tháng
    if (dto.isPeriod == 'Y' && dto.periodType === 'MONTH' && dto.periodValue != null) {
      // dto.periodValue (1 - 31)
      const date = today.clone().date(dto.periodValue); // set ngày cho tháng/năm hiện tại

      this.logger.log(logbase, `MONTH ----> ${today.format('DD/MM/YYYY')}----> date(${dto.periodValue}),  ----> ${date.toDate().toLocaleDateString()}`);

      // Nếu tháng bị thay đổi → nghĩa là ngày không tồn tại
      if (date.month() !== today.month()) {
        alramDto.taskDate = null;
      } else {
        alramDto.taskDate = date.toDate(); // YYYY-MM-DD
      }
    }

    // gán giá trị taskDate vào alarm DTO cho chu kỳ thứ trong tuần
    if (dto.isPeriod == 'Y' && dto.periodType === 'WEEK' && dto.periodValue != null) {
      const isoDay = dto.periodValue; // 1 = Thứ 2 -> 7 = Chủ nhật

      const date = today.clone().isoWeekday(isoDay);
      this.logger.log(logbase, `WEEK ----> ${today.format('DD/MM/YYYY')}----> date(${dto.periodValue}),  ----> ${date.toDate().toLocaleDateString()}`);

      // Kiểm tra có bị nhảy sang tuần khác không
      if (date.isoWeek() !== today.isoWeek()) {
        alramDto.taskDate = null;
      } else {
        alramDto.taskDate = date.toDate();
      }
    }
    return alramDto;
  }

  async setTaskAlarmPeriod(userCode: string, dto: SetTaskPeriodDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setTaskAlarmPeriod:`;

    // kiểm tra duplicate chu kỳ lịch nhắc
    const isDuplicatePeriod = await this.todoAppRepository.checkDuplicateTaskPeriod(userCode, dto);
    if (isDuplicatePeriod) {
      this.logger.log(logbase, Msg.DuplicateTaskPeriod + `(${dto.userHomeCode})`);
      return -2;
    }

    // kiểm tra duplicate lịch nhắc
    let alramDto = await this.handleAlarmDataByPeriodData(dto, '');

    const isDuplicateAlarm = await this.todoAppRepository.checkDuplicateTaskAlarm(userCode, alramDto);
    if (isDuplicateAlarm) {
      this.logger.log(logbase, Msg.DuplicateTaskAlram + `(${dto.userHomeCode})`);
      return -1;
    }

    // insert lịh nhắc theo ngày tùy chỉnh
    if (dto.isPeriod == 'N' && dto.specificValue != null) {
      alramDto.taskPeriodCode = null; // taskPeriodCode sẽ null
      const result = await this.todoAppRepository.insertTaskAlarm(userCode, alramDto);
      this.logger.log(logbase, `Đã thêm lịch nhắc ${moment(alramDto.taskDate).format('YYYY-MM-DD')} cho nhà yến ${dto.userHomeCode}`);

      return result;
    }

    // insert lịch nhắc theo chu kỳ
    if (dto.isPeriod == 'Y' && dto.periodType != null && dto.periodValue != null) {
      const { taskPeriodCode, insertId } = await this.todoAppRepository.insertTaskPeriod(userCode, dto);
      if (alramDto.taskDate == null) {
        //* VD:  2025-02-31 - KO  HỢP LỆ,  2025-03-31 - HỢP LỆ
        this.logger.log(logbase, `Thời gian lịch nhắc không hợp lệ nhưng có thể hợp lệ vào thời điểm khác -> không thể thêm lịch nhắc, chỉ có thể thêm cấu hình chu kỳ, không thêm dữ liệu lịch nhắc`);
        return 1;
      }
      if (insertId && alramDto.taskDate != null) {
        this.logger.log(logbase, `Đã thiết lập cấu hình lịch nhắc theo chu kỳ cho nhà yến ${dto.userHomeCode}`);

        alramDto.taskPeriodCode = taskPeriodCode; // taskPeriodCode bắt buộc có
        const result = await this.todoAppRepository.insertTaskAlarm(userCode, alramDto);
        this.logger.log(logbase, `Đã thêm lịch nhắc ${moment(alramDto.taskDate).format('YYYY-MM-DD')} cho nhà yến ${dto.userHomeCode}`);

        return result;
      }
    }
    return 0;
  }
}
