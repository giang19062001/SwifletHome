import { BadRequestException } from '@nestjs/common';
import { SetTaskAlarmDto } from './todo.dto';
import { Msg } from 'src/helpers/message.helper';

export default class TodoAppValidate {
  static SetTaskAlarmValidate(dto: SetTaskAlarmDto): string {
    let error = '';
    // BẮT LỖI LOGIC
    if (dto.isCustomTask == 'Y' && String(dto.taskCustomName) == '') {
      error = Msg.CannotNull('taskCustomName');
      return error;
    }
    if (dto.isCustomTask == 'N' && dto.taskCode == null) {
      error = Msg.CannotNull('taskCode');
      return error;
    }
    // ĐỒNG HÓA LOGIC DỮ LIỆU
    if (dto.isCustomTask === 'Y') {
      dto.taskCode = null;
    }
    if (dto.isCustomTask === 'N') {
      dto.taskCustomName = '';
    }

    // Kiểm tra type
    const validTaskTypes: string[] = ['WEEK', 'MONTH', 'SPECIFIC'];
    if (!validTaskTypes.includes(dto.taskType)) {
      error = Msg.InvalidValue('taskType');
      return error;
    }

    // nếu là  WEEK | MONTH
    if (dto.taskType === 'WEEK' || dto.taskType === 'MONTH') {
      // specificValue phải null
      dto.specificValue = null;

      //periodValue bắt buộc phải có
      if (dto.periodValue == null) {
        error = Msg.CannotNull('periodValue');
        return error;
      }

      // WEEK: 0–6
      if (dto.taskType === 'WEEK') {
        if (dto.periodValue < 0 || dto.periodValue > 6 || !Number.isInteger(dto.periodValue)) {
          error = Msg.InvalidRange('periodValue', '0 -> 6');
          return error;
        }
      }

      // MONTH: 1–31
      if (dto.taskType === 'MONTH') {
        if (dto.periodValue < 1 || dto.periodValue > 31 || !Number.isInteger(dto.periodValue)) {
          error = Msg.InvalidRange('periodValue', '1 -> 31');
          return error;
        }
      }
    } else if (dto.taskType === 'SPECIFIC') {
      // periodValue phải null
      dto.periodValue = null;

      //specificValue bắt buộc phải có
      if (dto.specificValue == null) {
        error = Msg.CannotNull('specificValue');
        return error;
      }
      // kiểm tra date
      const parsedDate = new Date(dto.specificValue);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsedDate < today) {
        error = Msg.DateCannotInThePast;
        return error;
      }
    }
    return error
  }
}
