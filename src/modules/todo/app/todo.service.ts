import { Injectable } from '@nestjs/common';
import { ITodoHomeTaskAlram, ITodoTask } from '../todo.interface';
import { TodoAppRepository } from './todo.repository';
import { LoggingService } from 'src/common/logger/logger.service';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { SetTaskAlarmDto } from './todo.dto';
import { Msg } from 'src/helpers/message.helper';
import { PagingDto } from 'src/dto/admin.dto';
import { IListApp } from 'src/interfaces/app.interface';

@Injectable()
export class TodoAppService {
  private readonly SERVICE_NAME = 'TodoAppService';

  constructor(
    private readonly todoAppRepository: TodoAppRepository,
    private readonly userHomeAppService: UserHomeAppService,
    private readonly logger: LoggingService,
  ) {}

  async getTasks(): Promise<ITodoTask[]> {
    const logbase = `${this.SERVICE_NAME}/getTasks:`;
    const list = await this.todoAppRepository.getTasks();
    this.logger.log(logbase, `list.length(${list.length})`);

    return list;
  }

  async getScheduledTasks(userCode: string, userHomeCode: string) {
    const home = await this.userHomeAppService.getDetail(userHomeCode);
    // nếu nhà yến chính có
    if (home) {
      return {
        keys: [
          {
            key: 'harvest',
            text: 'Thu hoạch',
          },
          {
            key: 'rollMedicine',
            text: 'Lăn thuốc',
          },
          {
            key: 'luringBird',
            text: 'Chim đêm',
          },
        ],
        values: {
          harvest: '5',
          rollMedicine: 'NaN',
          luringBird: 'NaN',
        },
      };
    } else {
      return null;
    }
  }
  async getListTaskAlarms(userCode: string, userHomeCode: string, dto: PagingDto): Promise<IListApp<ITodoHomeTaskAlram>> {
    const logbase = `${this.SERVICE_NAME}/getTaskAlarms:`;

    const total = await this.todoAppRepository.getTotalTaskAlarm(userCode, userHomeCode);
    const list = await this.todoAppRepository.getListTaskAlarms(userCode, userHomeCode, dto);
    this.logger.log(logbase, `total(${total})`);

    return { total, list };
  }

  async setTaskAlarm(userCode: string, dto: SetTaskAlarmDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setTaskAlarm:`;
    const isDuplicate = await this.todoAppRepository.checkDuplicateTaskAlarm(userCode, dto);
    if (isDuplicate) {
      this.logger.log(logbase, Msg.DuplicateTaskAlram + `(${dto.userHomeCode})`);
      return -1;
    }
    const result = await this.todoAppRepository.setTaskAlarm(userCode, dto);
    this.logger.log(logbase, `Thiết lập lịch nhắc cho nhà yến ${dto.userHomeCode} thành công`);
    return result;
  }
}
