import { Injectable } from '@nestjs/common';
import { ITodoTask } from '../todo.interface';
import { TodoAppRepository } from './todo.repository';
import { LoggingService } from 'src/common/logger/logger.service';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { SetupTodoTaskDto } from './todo.dto';

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

  async setupTodoTask(userCode: string, dto: SetupTodoTaskDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setupTodoTask:`;
    const result = await this.todoAppRepository.setupTodoTask(userCode, dto);
    this.logger.log(logbase, `Thiết lập lịch nhắc cho nhà yến${dto.userHomeCode} thành công`);
    return result;
  }
}
