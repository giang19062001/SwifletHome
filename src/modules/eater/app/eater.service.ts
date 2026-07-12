import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { LoggingService } from 'src/common/logger/logger.service';
import { AUTH_CONFIG } from 'src/modules/auth/common/auth.config';
import { TokenEaterAppResDto } from '../../auth/app/auth.response';
import { EaterEntryDto } from './eater.dto';
import { EaterAppRepository } from './eater.repository';
import { EaterAuthResDto } from './eater.response';

@Injectable()
export class EaterAppService {
  private readonly SERVICE_NAME = 'EaterAppService';

  constructor(
    private readonly eaterAppRepository: EaterAppRepository,
    private readonly jwtService: JwtService,
    private readonly logger: LoggingService,
  ) {}

  async findEaterByCode(eaterCode: string): Promise<TokenEaterAppResDto | null> {
    return await this.eaterAppRepository.findEaterByCode(eaterCode);
  }

  async entry(dto: EaterEntryDto): Promise<EaterAuthResDto> {
    const logbase = `${this.SERVICE_NAME}/entry`;

    const record = await this.eaterAppRepository.findByDeviceToken(dto.deviceToken);

    let eaterCode = '';
    let userTypeKeyWord = '';

    if (record) {
      this.logger.log(logbase, `DeviceToken đã tồn tại: ${dto.deviceToken}. Cập nhật entryTime.`);
      await this.eaterAppRepository.updateEntryTime(dto.deviceToken);
      eaterCode = record.eaterCode;
      userTypeKeyWord = record.userTypeKeyWord;
    } else {
      this.logger.log(logbase, `DeviceToken mới: ${dto.deviceToken}. Đang tạo mới eater.`);
      const newRecord = await this.eaterAppRepository.insertEater(dto.deviceToken);
      if (!newRecord) {
        this.logger.error(logbase, `Không thể tạo mới eater cho deviceToken: ${dto.deviceToken}`);
        throw new BadRequestException('Không thể tạo mới tài khoản người ăn yến');
      }
      eaterCode = newRecord.eaterCode;
      userTypeKeyWord = newRecord.userTypeKeyWord;
    }

    // Ký token chứa  eaterCode, deviceToken và userTypeKeyWord
    const payload = {
      eaterCode: eaterCode,
      deviceToken: dto.deviceToken,
      userTypeKeyWord: userTypeKeyWord,
    };

    const expiresIn: JwtSignOptions['expiresIn'] = AUTH_CONFIG.EXPIRED_APP_SAVE;
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    return {
      eaterCode: eaterCode,
      userTypeKeyWord: userTypeKeyWord,
      accessToken: accessToken,
    };
  }
}
