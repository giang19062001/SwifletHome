import { Injectable } from '@nestjs/common';
import { APP_SCREENS } from 'src/helpers/const.helper';
import { replaceNbspToSpace } from 'src/helpers/func.helper';
import { UserAppService } from 'src/modules/user/app/user.service';
import { ScreenSignupServiceResDto } from '../../screen.response';
import { IScreenStrategy } from '../screen.interface';
import { GetContentScreenResDto } from '../screen.response';

@Injectable()
export class RequestDoctorStrategy implements IScreenStrategy {
  constructor(
    private readonly userAppService: UserAppService,
  ) {}

  canHandle(keyword: string): boolean {
    return keyword === APP_SCREENS.REQUEST_DOCTOR;
  }

  async execute(userCode: string, screen: any): Promise<GetContentScreenResDto | null> {
    if (!screen.screenContent) return null;

    // lấy thông tin gói của user
    const userPackage = await this.userAppService.getUserPackageInfo(userCode);
    const remainDay = userPackage?.packageRemainDay ?? 0;
    let contentStart = replaceNbspToSpace(screen.screenContent.contentStart);
    if (remainDay > 0) {
      // người dùng đang xài gói nâng cấp và còn hạn → ẩn nút thanh toán
      contentStart = contentStart.replace(/\[\[payment\]\]/g, ``);
    }

    return {
      contentStart: contentStart,
      contentCenter: screen.screenContent.contentCenter,
      contentEnd: replaceNbspToSpace(screen.screenContent.contentEnd),
    } as ScreenSignupServiceResDto;
  }
}
