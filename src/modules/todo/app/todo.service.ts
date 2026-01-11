import { Injectable } from '@nestjs/common';
import { ITodoHomeTaskAlram, ITodoHomeTaskPeriod, ITodoTask, TaskStatusEnum, TODO_CONST } from '../todo.interface';
import { TodoAppRepository } from './todo.repository';
import { LoggingService } from 'src/common/logger/logger.service';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { CompleteMedicineTaskDto, SetTaskAlarmDto, SetTaskPeriodDto } from './todo.dto';
import { Msg } from 'src/helpers/message.helper';
import { PagingDto } from 'src/dto/admin.dto';
import { IListApp } from 'src/interfaces/app.interface';
import moment from 'moment';
import TodoAppValidate from './todo.validate';

@Injectable()
export class TodoAppService {
  private readonly SERVICE_NAME = 'TodoAppService';

  constructor(
    private readonly todoAppRepository: TodoAppRepository,
    private readonly todoAppValidate: TodoAppValidate,
    private readonly userHomeAppService: UserHomeAppService,
    private readonly logger: LoggingService,
  ) {}

  // TODO: BOX-TASK
  async getScheduledTasks(userCode: string, userHomeCode: string): Promise<{ [key: string]: string }[]> {
    const logbase = `${this.SERVICE_NAME}/getScheduledTasks:`;

    // userHomeCode -> main home
    const home = await this.userHomeAppService.getDetail(userHomeCode);
    const boxTasks = await this.todoAppRepository.getBoxTasks();
    if (!home || !boxTasks.length) {
      return boxTasks.map((ele) => {
        return {
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
        const data = await this.todoAppRepository.getOneTaskAlarmsNearly(userCode, userHomeCode, ele.taskCode, ele.taskName, today.format('YYYY-MM-DD'));

        this.logger.log(logbase, `taskDate of (userCode:${userCode}, userHomeCode:${userHomeCode}, taskCode:${ele.taskCode}, taskName:${ele.taskName}) --> ${data?.taskDate}`);

        if (!data?.taskDate) {
          return {
            label: ele.taskName,
            value: '_ / _',
            date: '',
            unit: '',
          };
        }

        const taskDate = moment(data.taskDate);
        const diff = taskDate.diff(today, 'days');

        return {
          label: ele.taskName,
          value: diff.toString(),
          date: taskDate.format('YYYY-MM-DD'),
          unit: 'ngày',
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

  async setTaskAlarmPeriod(userCode: string, dto: SetTaskPeriodDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setTaskAlarmPeriod:`;

    // kiểm tra duplicate chu kỳ lịch nhắc
    const isDuplicatePeriod = await this.todoAppRepository.checkDuplicateTaskPeriod(userCode, dto);
    if (isDuplicatePeriod) {
      this.logger.log(logbase, Msg.DuplicateTaskPeriod + `(${dto.userHomeCode})`);
      return -2;
    }

    // kiểm tra duplicate lịch nhắc
    let alramDto = await this.todoAppValidate.handleAlarmDataByPeriodData(dto, '');

    // taskDate khác null mới kiểm tra
    if (alramDto.taskDate != null) {
      const isDuplicateAlarm = await this.todoAppRepository.checkDuplicateTaskAlarm(userCode, alramDto);
      if (isDuplicateAlarm) {
        this.logger.log(logbase, Msg.DuplicateTaskAlram + `(${dto.userHomeCode})`);
        return -1;
      }
    }

    // insert lịch nhắc theo ngày tùy chỉnh
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

  async setCompleteTaskMedicine(userCode: string, dto: CompleteMedicineTaskDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setCompleteTaskMedicine:`;
    const alramDetail = await this.todoAppRepository.getOneTaskAlarm(dto.taskAlarmCode)
    console.log("alramDetail -----> ", alramDetail);
    if(!alramDetail?.taskKeyword){
      // taskAlarmCode này không phải là lịch nhắc chọn công việc có sẵn
      return -1
    }
     if(alramDetail?.taskKeyword !== TODO_CONST.TASK_EVENT.MEDICINE.value){
      // taskAlarmCode này không phải lắn thuốc
      return -2
    }
    const checkDuplicate = await this.todoAppRepository.getTaskCompleteMedicine(dto.taskAlarmCode)
    if(checkDuplicate){
      // taskAlarmCode này đã được insert dữ liệu lăn thuôc rồi
      return -3
    }
    const result = await this.todoAppRepository.insertTaskCompleteMedicine(userCode, dto);

    return result;
  }
}
