import { Injectable} from '@nestjs/common';
import { Msg } from 'src/helpers/message.helper';
import { LoggingService } from 'src/common/logger/logger.service';
import { PackageAppService } from 'src/modules/package/app/package.service';
import { InfoAppService } from 'src/modules/info/app/info.service';
import { IInfoBank } from 'src/modules/info/info.interface';
import { IScreenSignupService } from '../screen.interface';
import { ScreenAppRepository } from './screen.repository';
import { KEYWORDS } from 'src/helpers/const.helper';

@Injectable()
export class ScreenAppService {
  private readonly SERVICE_NAME = 'ScreenAppService';

  constructor(
    private readonly screenAppRepository: ScreenAppRepository,
    private readonly packageAppService: PackageAppService,
    private readonly infoAppService: InfoAppService,
    private readonly logger: LoggingService,
  ) {}

  async getContent(keyword: string): Promise<any> {
    const screen = await this.screenAppRepository.getDetail(keyword);
    let result: any | null = null;

    if (screen) {
      switch (keyword) {
        case KEYWORDS.SCREEN.SIGNUP_SERVICE:
          if (screen.screenContent) {
            const packages = await this.packageAppService.getAll({ limit: 0, page: 0 });
            const bankInfo = await this.infoAppService.getDetail('BANK');

            result = {
              contentStart: screen.screenContent.contentStart,
              contentCenter: {
                packages: packages,
                bankInfo: bankInfo ? (bankInfo.infoContent as IInfoBank) : null,
              },
              contentEnd: screen.screenContent.contentEnd,
            } as IScreenSignupService;
          }
          break;

        default:
          break;
      }
    }
    return result;
  }
}
