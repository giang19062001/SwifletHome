import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { APP_SCREENS } from 'src/helpers/const.helper';
import { ScreenRequestDoctorResDto, ScreenResDto } from "../screen.response";
import { UpdateScreenDto } from './screen.dto';
import { ScreenAdminRepository } from './screen.repository';

@Injectable()
export class ScreenAdminService {
  constructor(private readonly screenAdminRepository: ScreenAdminRepository) {}
  async getAll(dto: PagingDto): Promise<{ total: number; list: ScreenResDto[] }> {
    const total = await this.screenAdminRepository.getTotal();
    const list = await this.screenAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(screenKeyword: string): Promise<ScreenResDto | null> {
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
      let screenContent: ScreenRequestDoctorResDto = {
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
