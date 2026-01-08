import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { IUserHome, IUserHomeImageStr } from '../app/userHome.interface';
import { IList, YnEnum } from 'src/interfaces/admin.interface';
import { UserHomeAdminRepository } from './userHome.repository';
import { GetHomesAdminDto, TriggerUserHomeSensorDto } from './userHome.dto';
import { IUserHomeSensor } from './userhome.interface';

@Injectable()
export class UserHomeAdminService {
  private readonly SERVICE_NAME = 'UserHomeAdminService';

  constructor(
    private readonly userHomeAdminRepository: UserHomeAdminRepository,
    private readonly logger: LoggingService,
  ) {}
  async getAll(dto: GetHomesAdminDto): Promise<IList<IUserHome>> {
    const total = await this.userHomeAdminRepository.getTotal(dto);
    const list = await this.userHomeAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(userHomeCode: string): Promise<IUserHomeSensor | null> {
    const result = await this.userHomeAdminRepository.getDetail(userHomeCode);
    return result;
  }
  async triggerHome(dto: TriggerUserHomeSensorDto, updatedId: string, userHomeCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/triggerHome`;

    let res = 0;
    // insert giá trị sensor vào db
    const resultSensor = await this.userHomeAdminRepository.insertSensorForHome(dto, userHomeCode, updatedId);
    this.logger.log(logbase, `Thêm cảm biến với Mac ${dto.macId} cho nhà yến ${userHomeCode} của khách hàng ${dto.userCode}`);
    if (resultSensor) {
      // cập nhập isTriggered cho home
      const result = await this.userHomeAdminRepository.triggerHome(userHomeCode, updatedId);
      this.logger.log(logbase, `Kích hoạt cảm biến nhà yến ${userHomeCode} của khách hàng ${dto.userCode}`);
      res = result;
    }
    return res;
  }
   async resetTriggeringHome(dto: TriggerUserHomeSensorDto, updatedId: string, userHomeCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/resetTriggeringHome`;
    const result = await this.userHomeAdminRepository.updateSensorForHome(dto, userHomeCode, updatedId);
    this.logger.log(logbase, `Cập nhập cảm biến với Mac ${dto.macId} cho nhà yến ${userHomeCode} của khách hàng ${dto.userCode}`);
    return result;
  }
}
