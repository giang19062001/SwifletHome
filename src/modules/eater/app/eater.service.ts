import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { LoggingService } from 'src/common/logger/logger.service';
import { AUTH_CONFIG } from 'src/modules/auth/auth.config';
import { EaterEntryDto } from './eater.dto';
import { EaterAuthResDto } from './eater.response';
import { EaterAppRepository } from './eater.repository';

@Injectable()
export class EaterAppService {
  private readonly SERVICE_NAME = 'EaterAppService';

  constructor(
    private readonly eaterAppRepository: EaterAppRepository,
    private readonly jwtService: JwtService,
    private readonly logger: LoggingService,
  ) {}

  async entry(dto: EaterEntryDto): Promise<EaterAuthResDto> {
    const logbase = `${this.SERVICE_NAME}/entry`;

    const record = await this.eaterAppRepository.findByDeviceToken(dto.deviceToken);

    let eaterCode = '';
    let userTypeCode = '';

    if (record) {
      this.logger.log(logbase, `DeviceToken đã tồn tại: ${dto.deviceToken}. Cập nhật entryTime.`);
      await this.eaterAppRepository.updateEntryTime(dto.deviceToken);
      eaterCode = record.eaterCode;
      userTypeCode = record.userTypeCode;
    } else {
      this.logger.log(logbase, `DeviceToken mới: ${dto.deviceToken}. Đang tạo mới eater.`);
      const newRecord = await this.eaterAppRepository.insertEater(dto.deviceToken);
      if (!newRecord) {
        this.logger.error(logbase, `Không thể tạo mới eater cho deviceToken: ${dto.deviceToken}`);
        throw new BadRequestException('Không thể tạo mới tài khoản người ăn yến');
      }
      eaterCode = newRecord.eaterCode;
      userTypeCode = newRecord.userTypeCode;
    }

    // Ký token chứa eaterCode và userTypeCode
    const payload = {
      eaterCode: eaterCode,
      userTypeCode: userTypeCode,
    };

    const expiresIn: JwtSignOptions['expiresIn'] = AUTH_CONFIG.EXPIRED_APP_SAVE;
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    return {
      eaterCode: eaterCode,
      userTypeCode: userTypeCode,
      accessToken: accessToken,
    };
  }
}
