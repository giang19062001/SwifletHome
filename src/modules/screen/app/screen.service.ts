import { Injectable } from '@nestjs/common';
import { Msg } from 'src/helpers/message.helper';
import { LoggingService } from 'src/common/logger/logger.service';
import { PackageAppService } from 'src/modules/package/app/package.service';
import { InfoAppService } from 'src/modules/info/app/info.service';
import { IInfoBank } from 'src/modules/info/info.interface';
import { IScreenSignupService } from '../screen.interface';
import { ScreenAppRepository } from './screen.repository';
import { APP_SCREENS } from 'src/helpers/const.helper';
import { replaceNbspToSpace } from 'src/helpers/func.helper';
import { PackageOptionTypeEnum } from 'src/modules/package/package.interface';

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
    const logbase = `${this.SERVICE_NAME}/getContent:`;
    this.logger.log(logbase, `keyword(${keyword})`);

    const screen = await this.screenAppRepository.getDetail(keyword);
    let result: any | null = null;

    if (screen) {
      switch (keyword) {
        case APP_SCREENS.SIGNUP_SERVICE:
          if (screen.screenContent) {
            // gói
            const packageActive = await this.packageAppService.getOne();
            let packages: string[] = [];
            if (packageActive) {
              let packageTxt = '';
              if (packageActive.packageOptionType == PackageOptionTypeEnum.ITEM) {
                // chỉ hiện tên vật phẩm
                packageTxt = packageActive.packageItemSamePrice ? '/ ' + packageActive.packageItemSamePrice : '';
              } else if (packageActive.packageOptionType == PackageOptionTypeEnum.MONEY) {
                // chỉ hiện giá
                packageTxt = `${packageActive.packagePrice}đ`;
              } else if (packageActive.packageOptionType == PackageOptionTypeEnum.BOTH) {
                // hiện giá và vật phẩm
                packageTxt = `${packageActive.packagePrice}đ / ${packageActive.packageItemSamePrice}`;
              }
              const text = `${packageActive.packageName}: ${packageTxt}`;
              // luôn để gói là dữ liệu mảng
              packages.push(text);
            }
            // là vật phẩm -> ko hiện thông tin chuyển khoản
            if (packageActive.packageOptionType == PackageOptionTypeEnum.ITEM) {
              result = {
                contentStart: replaceNbspToSpace(screen.screenContent.contentStart),
                contentCenter: {
                  packages: packages,
                  bankInfo: null,
                },
                contentEnd: replaceNbspToSpace(screen.screenContent.contentEnd),
              };
            } else {
              // thông tin chuyển khoản
              const bankInfo = await this.infoAppService.getDetail('BANK');
              const infoContent: IInfoBank = bankInfo ? bankInfo.infoContent : null;
              result = {
                contentStart: replaceNbspToSpace(screen.screenContent.contentStart),
                contentCenter: {
                  packages: packages,
                  bankInfo: infoContent ? { ...infoContent, accountName: `${infoContent.accountNumber} - ${infoContent.accountName}` } : null,
                },
                contentEnd: replaceNbspToSpace(screen.screenContent.contentEnd),
              } as IScreenSignupService;
            }
          }
          break;
        case APP_SCREENS.REQUEST_DOCTOR:
          if (screen.screenContent) {
            result = {
              contentStart: replaceNbspToSpace(screen.screenContent.contentStart),
              contentCenter: {},
              contentEnd: replaceNbspToSpace(screen.screenContent.contentEnd),
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
