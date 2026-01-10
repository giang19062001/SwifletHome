import { Injectable } from '@nestjs/common';
import { PeriodTypeEnum, TaskStatusEnum } from '../todo.interface';
import { SetTaskAlarmDto, SetTaskPeriodDto } from './todo.dto';
import { Msg } from 'src/helpers/message.helper';
import { LoggingService } from 'src/common/logger/logger.service';
import { TodoAppRepository } from './todo.repository';
import moment from 'moment';

@Injectable()
export default class TodoAppValidate {
  private readonly SERVICE_NAME = 'TodoAppValidate';

  constructor(
    private readonly todoAppRepository: TodoAppRepository,
    private readonly logger: LoggingService,
  ) {}
  static SetTaskPeriodValidate(dto: SetTaskPeriodDto): string {
    let error = '';

    // BẮT LỖI RỖNG
    if (dto.isCustomTask == 'Y' && String(dto.taskCustomName) == '') {
      error = Msg.CannotNull('taskCustomName');
      return error;
    }
    if (dto.isCustomTask == 'N' && dto.taskCode == null) {
      error = Msg.CannotNull('taskCode');
      return error;
    }

    if (dto.isPeriod == 'Y' && dto.periodType == null) {
      error = Msg.CannotNull('periodType');
      return error;
    }
    if (dto.isPeriod == 'Y' && dto.periodType != null && dto.periodValue == null) {
      error = Msg.CannotNull('periodValue');
      return error;
    }
    if (dto.isPeriod === 'Y' && dto.periodType != null && !Object.values(PeriodTypeEnum).includes(dto.periodType)) {
      error = Msg.InvalidValue('periodType');
      return error;
    }

    if (dto.isPeriod == 'N' && dto.specificValue == null) {
      error = Msg.CannotNull('specificValue');
      return error;
    }

    // CHUẨN HÓA DỮ LIỆU TÊN TASK
    if (dto.isCustomTask === 'Y') {
      dto.taskCode = null;
    }
    if (dto.isCustomTask === 'N') {
      dto.taskCustomName = '';
    }

    //CHUẨN TASK PERIOD
    if (dto.isPeriod == 'Y' && (dto.periodType === 'WEEK' || dto.periodType === 'MONTH')) {
      // specificValue phải null
      dto.specificValue = null;

      //periodValue bắt buộc phải có
      if (dto.periodValue == null) {
        error = Msg.CannotNull('periodValue');
        return error;
      }

      // WEEK: 1 - 7
      if (dto.periodType === 'WEEK') {
        if (dto.periodValue < 1 || dto.periodValue > 7 || !Number.isInteger(dto.periodValue)) {
          error = Msg.InvalidRange('periodValue', '1 -> 7');
          return error;
        }
      }

      // MONTH: 1–31
      if (dto.periodType === 'MONTH') {
        if (dto.periodValue < 1 || dto.periodValue > 31 || !Number.isInteger(dto.periodValue)) {
          error = Msg.InvalidRange('periodValue', '1 -> 31');
          return error;
        }
      }
    }
    //CHUẨN TASK TÙY CHỈNH

    if (dto.isPeriod === 'N') {
      // periodValue phải null
      dto.periodValue = null;

      //specificValue bắt buộc phải có
      if (dto.specificValue == null) {
        error = Msg.CannotNull('specificValue');
        return error;
      }
      const specificDate = new Date(dto.specificValue);
      const now = new Date();

      // reset cả 2 về đầu ngày
      specificDate.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);

      // validate ngày hợp lệ
      if (isNaN(specificDate.getTime())) {
        return Msg.InvalidValue('specificValue');
      }

      // specificValue phải lớn hơn và bằng ngày hiện tại
      if (specificDate < now) {
        return Msg.MustBeGreaterThanAndEqualNow('specificValue');
      }

      dto.specificValue = specificDate;
    }
    return error;
  }
  // TODO: PERIOD + ALARM
  async handleAlarmDataByPeriodData(dto: SetTaskPeriodDto, taskPeriodCode: string): Promise<SetTaskAlarmDto> {
    const logbase = `${this.SERVICE_NAME}/handleAlarmDataByPeriodData:`;

    let alramDto: SetTaskAlarmDto = {
      taskPeriodCode: taskPeriodCode,
      userHomeCode: dto.userHomeCode,
      taskCode: dto.taskCode,
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

    // const today = moment('2026-02-15'); // ! DEV
    const today = moment(); // ! PROD

    // gán giá trị taskDate vào alarm DTO cho chu kỳ ngày trong tháng
    if (dto.isPeriod == 'Y' && dto.periodType === 'MONTH' && dto.periodValue != null) {
      // dto.periodValue (1 - 31)
      let date = today.clone().date(dto.periodValue); // set ngày cho tháng/năm hiện tại

      // Nếu tháng bị thay đổi → nghĩa là ngày không tồn tại
      if (date.month() !== today.month()) {
        alramDto.taskDate = null;
      } else {
        // Nếu ngày đã qua -> chỉ tạo chu kỳ, ko tạo lịch nhắc -> để null
        if (date.isBefore(today, 'day')) {
          alramDto.taskDate = null;
        } else {
          // ngày chưa qu
          alramDto.taskDate = date.toDate(); // YYYY-MM-DD
        }
      }
      this.logger.log(logbase, `MONTH ----> ${today.format('DD/MM/YYYY')}----> date(${dto.periodValue}),  ----> ${date.toDate().toLocaleDateString()}`);
    }

    // gán giá trị taskDate vào alarm DTO cho chu kỳ thứ trong tuần
    if (dto.isPeriod == 'Y' && dto.periodType === 'WEEK' && dto.periodValue != null) {
      const isoDay = dto.periodValue; // 1 = Thứ 2 -> 7 = Chủ nhật

      let date = today.clone().isoWeekday(isoDay);

      // Nếu ngày đã qua -> lấy ngày của tuần sau (đang là chủ nhật -> chọn thứ 3 -> lấy thứ 3 tuần sau)
      if (date.isBefore(today, 'day')) {
        date = date.add(1, 'week');
      }

      alramDto.taskDate = date.toDate();

      this.logger.log(logbase, `WEEK ----> ${today.format('DD/MM/YYYY')}----> date(${dto.periodValue}),  ----> ${date.toDate().toLocaleDateString()}`);
    }
    return alramDto;
  }
}
