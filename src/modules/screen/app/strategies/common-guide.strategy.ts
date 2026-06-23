import { Injectable } from '@nestjs/common';
import { APP_SCREENS } from 'src/helpers/const.helper';
import { ScreenCommonGuideResDto } from '../../screen.response';
import { IScreenStrategy } from '../screen.interface';
import { GetContentScreenResDto } from '../screen.response';

@Injectable()
export class CommonGuideStrategy implements IScreenStrategy {
  canHandle(keyword: string): boolean {
    return keyword === APP_SCREENS.REQUEST_QR_GUIDE || keyword === APP_SCREENS.CONSIGNMENT_GUIDE || keyword === APP_SCREENS.USER_TYPE_NOT_REGISTER;
  }

  async execute(screen: any): Promise<GetContentScreenResDto | null> {
    if (!screen.contentStart) return null;

    return {
      contentStart: screen.contentStart,
      contentCenter: {},
      contentEnd: '',
    } as ScreenCommonGuideResDto;
  }
}
