import { Injectable } from '@nestjs/common';
import { ITodoTask } from '../todo.interface';
import { TodoAppRepository } from './todo.repository';
import { LoggingService } from 'src/common/logger/logger.service';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';

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
          harvest: 'NA',
          rollMedicine: 'NA',
          luringBird: 'NA',
        },
      };
    } else {
      return null;
    }
  }
}
