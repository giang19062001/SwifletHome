import { Injectable } from '@nestjs/common';
import { ITodoTaskAlram, TaskStatusEnum } from '../todo.interface';
import { Msg } from 'src/helpers/message.helper';
import { LoggingService } from 'src/common/logger/logger.service';
import { SetTaskAlarmDto } from './todo.dto';

@Injectable()
export default class TodoAppValidate {
  private readonly SERVICE_NAME = 'TodoAppValidate';

  constructor(private readonly logger: LoggingService) {}

  static setTaskAlarmValidate(dto: SetTaskAlarmDto): string {
    let error = '';

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

    return error;
  }

  async handleAlarmData(dto: SetTaskAlarmDto): Promise<ITodoTaskAlram> {
    const logbase = `${this.SERVICE_NAME}/handleAlarmData:`;

    let alramDto: ITodoTaskAlram = {
      userHomeCode: dto.userHomeCode,
      taskCode: null,
      taskName: '',
      taskNote: dto.taskNote,
      taskDate: new Date(),
      taskStatus: TaskStatusEnum.WAITING,
    };

    // gán giá trị taskName vào alarm DTO
    if (dto.taskCustomName) {
      alramDto.taskName = dto.taskCustomName;
    }

    // gán giá trị taskDate vào alarm DTO cho ngày cụ thể
    if (dto.specificValue != null) {
      alramDto.taskDate = dto.specificValue;
    }

    return alramDto;
  }
}
