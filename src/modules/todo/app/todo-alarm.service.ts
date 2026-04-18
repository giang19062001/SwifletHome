import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { LoggingService } from 'src/common/logger/logger.service';
import { PagingDto } from 'src/dto/admin.dto';
import { Msg } from 'src/helpers/message.helper';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { TaskStatusEnum, TODO_CONST } from '../todo.interface';
import { TodoTaskResDto } from '../todo.response';
import { TodoAlarmAppRepository } from './todo-alram.repository';
import { TodoHarvestAppRepository } from './todo-harvest.repository';
import { TodoMedicineAppRepository } from './todo-medicine.repository';
import { SetTaskAlarmDto } from './todo.dto';
import TodoAppValidate from './todo.validate';

@Injectable()
export class TodoAlarmAppService {
  private readonly SERVICE_NAME = 'TodoAlarmAppService';

  constructor(
    private readonly todoAlarmAppRepository: TodoAlarmAppRepository,
    private readonly todoHarvestAppRepository: TodoHarvestAppRepository,
    private readonly todoMedicineAppRepository: TodoMedicineAppRepository,
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

    const today = moment().format('YYYY-MM-DD');

    const result = await Promise.all(
      boxTasks.map(async (ele) => {
        let data: { taskDate: string; taskAlarmCode?: string; medicineCode?: string; taskStatus: string } | null = null;

        if (ele.taskKeyword === TODO_CONST.TASK_EVENT.HARVEST.value) {
          const harvestData = await this.todoHarvestAppRepository.getNextHarvestSchedule(userCode, home.userHomeCode, today);
          if (harvestData) {
            data = {
              taskDate: harvestData.taskDate,
              taskAlarmCode: harvestData.seq.toString(),
              taskStatus: harvestData.taskStatus,
            };
          }
        } else if (ele.taskKeyword === TODO_CONST.TASK_EVENT.MEDICINE.value) {
          const medicineData = await this.todoMedicineAppRepository.getNextMedicineSchedule(userCode, home.userHomeCode, today);
          if (medicineData) {
            data = {
              taskDate: medicineData.taskDate,
              taskAlarmCode: medicineData.medicineCode,
              taskStatus: medicineData.taskStatus,
            };
          }
        } else {
          // Custom alarm
          const alarmData = await this.todoAlarmAppRepository.getOneTaskAlarmsNearly(userCode, home.userHomeCode, ele.taskName, today);
          if (alarmData) {
            data = {
              taskDate: alarmData.taskDate as any,
              taskAlarmCode: alarmData.taskAlarmCode,
              taskStatus: alarmData.taskStatus,
            };
          }
        }

        this.logger.log(logbase, `taskData of (userCode:${userCode}, userHomeCode:${home.userHomeCode}, taskCode:${ele.taskCode}, taskName:${ele.taskName}) --> ${data?.taskDate ?? ' _ / _ '}`);

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
          const todayMoment = moment().startOf('day');
          const taskDate = moment(data.taskDate).startOf('day');
          const diff = taskDate.diff(todayMoment, 'days');

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
