import { Injectable} from '@nestjs/common';
import { Msg } from 'src/helpers/message';
import { LoggingService } from 'src/common/logger/logger.service';
import { ContentAppRepository } from './content.repository';
import { PackageAppService } from 'src/modules/package/app/package.service';
import { InfoAppService } from 'src/modules/info/app/info.service';
import { IInfoBank } from 'src/modules/info/info.interface';
import { IContentSignupService } from '../content.interface';

@Injectable()
export class ContentAppService {
  private readonly SERVICE_NAME = 'ContentAppService';

  constructor(
    private readonly contentAppRepository: ContentAppRepository,
    private readonly packageAppService: PackageAppService,
    private readonly infoAppService: InfoAppService,
    private readonly logger: LoggingService,
  ) {}

  async getDetail(contentCharacter: string): Promise<any> {
    const content = await this.contentAppRepository.getDetail(contentCharacter);
    let result: any | null = null;

    if (content) {
      switch (contentCharacter) {
        case 'SIGNUP_SERVICE':
          if (content.contentContent) {
            const packages = await this.packageAppService.getAll({ limit: 0, page: 0 });
            const bankInfo = await this.infoAppService.getDetail('BANK');

            result = {
              contentStart: content.contentContent.contentStart,
              contentCenter: {
                packages: packages,
                bankInfo: bankInfo ? (bankInfo.infoContent as IInfoBank) : null,
              },
              contentEnd: content.contentContent.contentEnd,
            } as IContentSignupService;
          }
          break;

        default:
          break;
      }
    }
    return result;
  }
}
