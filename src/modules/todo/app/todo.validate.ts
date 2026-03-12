import { Injectable } from '@nestjs/common';
import { TaskStatusEnum } from '../todo.interface';
import { LoggingService } from 'src/common/logger/logger.service';
import { SetTaskAlarmDto } from './todo.dto';
import { MsgDto } from 'src/helpers/message.helper';
import { TodoTaskAlramResDto } from "../todo.response";

@Injectable()
export default class TodoAppValidate {
  private readonly SERVICE_NAME = 'TodoAppValidate';

  constructor(private readonly logger: LoggingService) {}

  static setTaskAlarmValidate(dto: SetTaskAlarmDto): string {
    let error = '';

    //specificValue bắt buộc phải có
    if (dto.specificValue == null) {
      error = MsgDto.CannotNull('specificValue');
      return error;
    }
    const specificDate = new Date(dto.specificValue);
    const now = new Date();

    // reset cả 2 về đầu ngày
    specificDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    // validate ngày hợp lệ
    if (isNaN(specificDate.getTime())) {
      return MsgDto.InvalidValue('specificValue');
    }

    // specificValue phải lớn hơn và bằng ngày hiện tại
    if (specificDate < now) {
      return MsgDto.MustBeGreaterThanAndEqualNow('specificValue');
    }

    dto.specificValue = specificDate;

    return error;
  }

  async handleAlarmData(dto: SetTaskAlarmDto): Promise<any> {
    const logbase = `${this.SERVICE_NAME}/handleAlarmData:`;

    let alramDto: any = {
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
