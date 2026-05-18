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

    if (record) {
      this.logger.log(logbase, `DeviceToken đã tồn tại: ${dto.deviceToken}. Cập nhật entryTime.`);
      await this.eaterAppRepository.updateEntryTime(dto.deviceToken);
      eaterCode = record.eaterCode;
    } else {
      this.logger.log(logbase, `DeviceToken mới: ${dto.deviceToken}. Đang tạo mới eater.`);
      const newCode = await this.eaterAppRepository.insertEater(dto.deviceToken);
      if (!newCode) {
        this.logger.error(logbase, `Không thể tạo mới eater cho deviceToken: ${dto.deviceToken}`);
        throw new BadRequestException('Không thể tạo mới tài khoản người ăn yến');
      }
      eaterCode = newCode;
    }

    // Ký token chứa eaterCode
    const payload = {
      eaterCode: eaterCode,
    };

    const expiresIn: JwtSignOptions['expiresIn'] = AUTH_CONFIG.EXPIRED_APP_SAVE;
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    return {
      eaterCode: eaterCode,
      accessToken: accessToken,
    };
  }
}
