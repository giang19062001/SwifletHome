import { BadRequestException, Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { ITokenUserApp } from 'src/modules/auth/app/auth.interface';
import { TodoAppRepository } from 'src/modules/todo/app/todo.repository';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { GetInfoToRequestQrcodeResDto, TaskHarvestQrResDto } from './qr.dto';
import { Msg } from 'src/helpers/message.helper';
import { TodoAppService } from 'src/modules/todo/app/todo.service';

@Injectable()
export class QrAppService {
  private readonly SERVICE_NAME = 'QrAppService';
  constructor(
    private readonly todoAppRepository: TodoAppRepository,
    private readonly todoAppService: TodoAppService,
    private readonly userHomeAppService: UserHomeAppService,
    private readonly logger: LoggingService,
  ) {}
  async getInfoToRequestQrcode(userHomeCode: string, user: ITokenUserApp): Promise<GetInfoToRequestQrcodeResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getInfoToRequestQrcode:`;
    // lấy thông tin nhà
    const homeInfo = await this.userHomeAppService.getDetail(userHomeCode);
    if (!homeInfo) {
      this.logger.error(logbase, `Nhà yến ko có dữ liệu userHomeCode(${userHomeCode})`);
      throw new BadRequestException({ message: Msg.HomeNotFound, data: null });
    }

    // lấy thông tin lăn thuốc nhà yến này
    const taskMedicineList = await this.todoAppRepository.getTaskMedicineCompleteList(userHomeCode);

    // lấy thông tin thu hoạc nhà yến này
    let taskHarvestCompleteList = await this.todoAppRepository.getTaskHarvestCompleteList(userHomeCode);
    const taskHarvestList: TaskHarvestQrResDto[] = await Promise.all(
      taskHarvestCompleteList.map(async (ele) => ({
        harvestTaskAlarmCode: ele.harvestTaskAlarmCode,
        harvestPhase: ele.harvestPhase,
        harvestYear: ele.harvestYear,
        harvestData: await this.todoAppService.arrangeHarvestRows(ele.seq, homeInfo.userHomeFloor),
      })),
    );

    return {
      userName: user.userName,
      userHomeCode: userHomeCode,
      userHomeLength: homeInfo.userHomeLength,
      userHomeWidth: homeInfo.userHomeWidth,
      userHomeFloor: homeInfo.userHomeFloor,
      userHomeAddress: homeInfo.userHomeAddress,
      temperature: 0,
      humidity: 0,
      taskMedicineList: taskMedicineList,
      taskHarvestList: taskHarvestList,
    } as GetInfoToRequestQrcodeResDto;
  }
}
