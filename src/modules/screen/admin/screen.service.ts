import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { ScreenAdminRepository } from './screen.repository';
import { IScreen, IScreenRequestDoctor } from '../screen.interface';
import { UpdateScreenDto } from './screen.dto';
import { APP_SCREENS } from 'src/helpers/const.helper';

@Injectable()
export class ScreenAdminService {
  constructor(private readonly screenAdminRepository: ScreenAdminRepository) {}
  async getAll(dto: PagingDto): Promise<IList<IScreen>> {
    const total = await this.screenAdminRepository.getTotal();
    const list = await this.screenAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(screenKeyword: string): Promise<IScreen | null> {
    const result = await this.screenAdminRepository.getDetail(screenKeyword);
    if (result) {
      if (result.screenKeyword === APP_SCREENS.REQUEST_DOCTOR) {
        let screenContent = {
          contentStart: result.screenContent.contentStart,
          contentEnd: '',
          contentCenter: result.screenContent.contentCenter.symptom,
        };
        return { ...result, screenContent: screenContent };
      } else {
        return result; // APP_SCREENS.SIGNUP_SERVICE
      }
    } else {
      return null;
    }
  }

  async update(dto: UpdateScreenDto, updatedId: string, screenKeyword: string): Promise<number> {
    if (screenKeyword === APP_SCREENS.REQUEST_DOCTOR) {
      let screenContent: IScreenRequestDoctor = {
        contentStart: dto.screenContent.contentStart,
        contentEnd: '',
        contentCenter: {
          symptom: dto.screenContent.contentCenter as unknown as string,
        },
      };
      dto.screenContent = screenContent;
    }

    const result = await this.screenAdminRepository.update(dto, updatedId, screenKeyword);
    return result;
  }
}
