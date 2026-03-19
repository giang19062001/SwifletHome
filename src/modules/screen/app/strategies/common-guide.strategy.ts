import { Injectable } from '@nestjs/common';
import { APP_SCREENS } from 'src/helpers/const.helper';
import { ScreenSignupServiceResDto } from '../../screen.response';
import { IScreenStrategy } from '../screen.interface';
import { GetContentScreenResDto } from '../screen.response';

@Injectable()
export class CommonGuideStrategy implements IScreenStrategy {
  canHandle(keyword: string): boolean {
    return (
      keyword === APP_SCREENS.REQUEST_QR_GUIDE ||
      keyword === APP_SCREENS.CONSIGNMENT_GUIDE ||
      keyword === APP_SCREENS.USER_TYPE_NOT_REGISTER
    );
  }

  async execute(userCode: string, screen: any): Promise<GetContentScreenResDto | null> {
    if (!screen.screenContent) return null;

    let contentStart = screen.screenContent.contentStart;
    return {
      contentStart: contentStart,
      contentCenter: {},
      contentEnd: "",
    } as ScreenSignupServiceResDto;
  }
}
