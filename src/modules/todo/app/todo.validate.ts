import { PeriodTypeEnum } from '../todo.interface';
import { SetTaskPeriodDto } from './todo.dto';
import { Msg } from 'src/helpers/message.helper';
export default class TodoAppValidate {
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

      // validate ngày hợp lệ
      if (isNaN(specificDate.getTime())) {
        return Msg.InvalidValue('specificValue');
      }

      // specificValue phải lớn hơn và bằng ngày hiện tại
      if (specificDate < now) {
        return Msg.MustBeGreaterThanAndEqualNow('specificValue');
      }

      dto.specificValue = specificDate
    }
    return error;
  }
}
