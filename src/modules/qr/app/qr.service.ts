import { BadRequestException, Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { ITokenUserApp } from 'src/modules/auth/app/auth.interface';
import { TodoAppRepository } from 'src/modules/todo/app/todo.repository';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { GetInfoToRequestQrcodeResDto } from './qr.dto';
import { Msg } from 'src/helpers/message.helper';

@Injectable()
export class QrAppService {
  private readonly SERVICE_NAME = 'QrAppService';
  constructor(
    private readonly todoAppRepository: TodoAppRepository,
    private readonly userHomeAppService: UserHomeAppService,
    private readonly logger: LoggingService,
  ) {}
  async getInfoToRequestQrcode(userHomeCode: string, user: ITokenUserApp): Promise<GetInfoToRequestQrcodeResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getInfoToRequestQrcode:`;
    // lấy thông tin nhà
    const homeInfo = await this.userHomeAppService.getDetail(userHomeCode);
    if (homeInfo) {
      this.logger.error(logbase, `Nhà yến ko có dữ liệu userHomeCode(${userHomeCode})`);
      throw new BadRequestException({ message: Msg.HomeNotFound, data: null });
    }

    return {
      userName: '',
      userHomeCode: '',
      userHomeLength: 0,
      userHomeWidth: 0,
      userHomeFloor: 0,
      userHomeAddress: '',
      temperature: 0,
      humidity: 0,
      taskMedicineList: [],
      taskHarvestList: [],
    } as GetInfoToRequestQrcodeResDto;
  }
}
