import { Injectable } from '@nestjs/common';
import { APP_SCREENS } from 'src/helpers/const.helper';
import { replaceNbspToSpace } from 'src/helpers/func.helper';
import { InfoAppService } from 'src/modules/info/app/info.service';
import { InfoBankResDto } from 'src/modules/info/info.response';
import { PackageAppService } from 'src/modules/package/app/package.service';
import { PackageOptionTypeEnum } from 'src/modules/package/package.interface';
import { ScreenSignupServiceResDto } from '../../screen.response';
import { IScreenStrategy } from '../screen.interface';
import { GetContentScreenResDto } from '../screen.response';

@Injectable()
export class SignupServiceStrategy implements IScreenStrategy {
  constructor(
    private readonly packageAppService: PackageAppService,
    private readonly infoAppService: InfoAppService,
  ) {}

  canHandle(keyword: string): boolean {
    return keyword === APP_SCREENS.SIGNUP_SERVICE;
  }

  async execute(userCode: string, screen: any): Promise<GetContentScreenResDto | null> {
    if (!screen.screenContent) return null;

    // gói
    const packageActive = await this.packageAppService.getOne();
    let packages: string[] = [];
    if (packageActive) {
      let packageTxt = '';
      if (packageActive.packageOptionType == PackageOptionTypeEnum.ITEM) {
        // chỉ hiện tên vật phẩm
        packageTxt = packageActive.packageItemSamePrice;
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

    let result: GetContentScreenResDto;

    // là vật phẩm -> ko hiện thông tin chuyển khoản
    if (packageActive?.packageOptionType == PackageOptionTypeEnum.ITEM) {
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
      const infoContent: InfoBankResDto = bankInfo ? bankInfo.infoContent : null;
      result = {
        contentStart: replaceNbspToSpace(screen.screenContent.contentStart),
        contentCenter: {
          packages: packages,
          bankInfo: infoContent ? { ...infoContent, accountName: `${infoContent.accountNumber} - ${infoContent.accountName}` } : null,
        },
        contentEnd: replaceNbspToSpace(screen.screenContent.contentEnd),
      } as ScreenSignupServiceResDto;
    }

    return result;
  }
}
