import { Inject, Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { IScreenStrategy } from './screen.interface';
import { ScreenAppRepository } from './screen.repository';

@Injectable()
export class ScreenAppService {
  private readonly SERVICE_NAME = 'ScreenAppService';

  constructor(
    private readonly screenAppRepository: ScreenAppRepository,
    private readonly logger: LoggingService,
    @Inject('SCREEN_STRATEGIES') private readonly strategies: IScreenStrategy[],
  ) {}

  async getContent(userCode: string, keyword: string): Promise<any> {
    const logbase = `${this.SERVICE_NAME}/getContent:`;
    this.logger.log(logbase, `keyword(${keyword})`);

    const screen = await this.screenAppRepository.getDetail(keyword);
    if (!screen) return null;

    // tìm xem keyword này thuộc chiến lược nào
    const strategy = this.strategies.find((s) => s.canHandle(keyword));
    console.log("strategy", strategy);
    if (strategy) {
      // thực thi chiến lượng
      return strategy.execute(userCode, screen);
    }

    return null;
  }
}
