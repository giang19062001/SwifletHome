import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { LoggingService } from 'src/common/logger/logger.service';
import { PagingDto } from 'src/dto/admin.dto';
import { Msg } from 'src/helpers/message.helper';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { TaskStatusEnum } from '../todo.interface';
import { TodoTaskResDto } from '../todo.response';
import { TodoAlarmAppRepository } from './todo-alram.repository';
import { SetTaskAlarmDto } from './todo.dto';
import TodoAppValidate from './todo.validate';

@Injectable()
export class TodoAlarmAppService {
  private readonly SERVICE_NAME = 'TodoAlarmAppService';

  constructor(
    private readonly todoAlarmAppRepository: TodoAlarmAppRepository,
    private readonly todoAppValidate: TodoAppValidate,
    private readonly userHomeAppService: UserHomeAppService,
    private readonly logger: LoggingService,
  ) { }

  // TODO: BOX-TASK
  async getScheduledTasks(userCode: string): Promise<{ [key: string]: string }[]> {
    const logbase = `${this.SERVICE_NAME}/getScheduledTasks:`;

    // userHomeCode -> main home
    const home = await this.userHomeAppService.getMainHomeByUser(userCode);
    const boxTasks = await this.todoAlarmAppRepository.getBoxTasks();
    if (!home || !boxTasks.length) {
      return boxTasks.map((ele) => {
        return {
          taskAlarmCode: '',
          label: ele.taskName,
          value: '_ / _',
          date: '',
          unit: '',
        };
      });
    }

    const today = moment().startOf('day');

    const result = await Promise.all(
      boxTasks.map(async (ele) => {
        const data = await this.todoAlarmAppRepository.getOneTaskAlarmsNearly(userCode, home.userHomeCode, ele.taskCode, ele.taskName, today.format('YYYY-MM-DD'));

        this.logger.log(logbase, `taskDate of (userCode:${userCode}, userHomeCode:${home.userHomeCode}, taskCode:${ele.taskCode}, taskName:${ele.taskName}) --> ${data?.taskDate}`);

        const taskAlarmCode = data?.taskAlarmCode ?? '';
        if (!data?.taskDate) {
          return {
            taskAlarmCode: taskAlarmCode,
            label: ele.taskName,
            value: '_ / _',
            date: '',
            unit: '',
          };
        } else {
          const today = moment().startOf('day');
          const taskDate = moment(data.taskDate).startOf('day');
          const diff = taskDate.diff(today, 'days');

          return {
            taskAlarmCode: taskAlarmCode,
            label: ele.taskName,
            value: diff.toString(),
            date: taskDate.format('YYYY-MM-DD'),
            unit: 'ngày',
          };
        }
      }),
    );

    return result;
  }

  // TODO: TASK
  async getTasks(): Promise<TodoTaskResDto[]> {
    const logbase = `${this.SERVICE_NAME}/getTasks:`;
    const list = await this.todoAlarmAppRepository.getTasks();
    return list;
  }

  // TODO: ALARM
  async getListTaskAlarms(userCode: string, userHomeCode: string, dto: PagingDto): Promise<{ total: number; list: any[] }> {
    const logbase = `${this.SERVICE_NAME}/getTaskAlarms:`;

    const total = await this.todoAlarmAppRepository.getTotalTaskAlarm(userCode, userHomeCode);
    const list = await this.todoAlarmAppRepository.getListTaskAlarms(userCode, userHomeCode, dto);

    return { total, list };
  }

  async changeTaskAlarmStatus(taskStatus: TaskStatusEnum, userCode: string, taskAlarmCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/changeTaskAlarmStatus:`;
    const result = await this.todoAlarmAppRepository.changeTaskAlarmStatus(taskStatus, userCode, taskAlarmCode);
    this.logger.log(logbase, `cập nhập trạng thái của lịch nhắc thành (${taskStatus})`);
    return result;
  }

  async setTaskAlarm(userCode: string, dto: SetTaskAlarmDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setTaskAlarm:`;

    // kiểm tra duplicate lịch nhắc
    let alramDto = await this.todoAppValidate.handleAlarmData(dto);

    // taskDate khác null mới kiểm tra
    if (alramDto.taskDate != null) {
      const isDuplicateAlarm = await this.todoAlarmAppRepository.checkDuplicateTaskAlarm(userCode, alramDto);
      if (isDuplicateAlarm) {
        this.logger.log(logbase, Msg.DuplicateTaskAlram + `(${dto.userHomeCode})`);
        return -1;
      }
    }

    // insert lịch nhắc theo ngày tùy chỉnh
    if (dto.specificValue != null) {
      const result = await this.todoAlarmAppRepository.insertTaskAlarm(userCode, alramDto);
      this.logger.log(logbase, `Đã thêm lịch nhắc ${moment(alramDto.taskDate).format('YYYY-MM-DD')} cho nhà yến ${dto.userHomeCode}`);

      return result;
    }
    return 0;
  }

  async getListTaskAlarmsToday(todayStr: string) {
    return await this.todoAlarmAppRepository.getListTaskAlarmsToday(todayStr);
  }
}
