import { BadRequestException, Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { MailService } from 'src/common/mail/mail.service';
import { Msg } from 'src/helpers/message.helper';
import { OPTION_CONST } from 'src/modules/options/option.const';
import { OptionService } from 'src/modules/options/option.service';
import { HomeSaleSightSeeingStatusEnum } from '../common/saleHome.enum';
import { SaleHomeSightseeingAppRepository } from './saleHome-sightseeing.repository';
import { CreateHomeSightSeeingDto } from './saleHome.dto';
import { SaleHomeAppRepository } from './saleHome.repository';

@Injectable()
export class SaleHomeSightseeingAppService {
  private readonly SERVICE_NAME = 'SaleHomeSightseeingAppService';
  constructor(
    private readonly saleHomeSightseeingAppRepository: SaleHomeSightseeingAppRepository,
    private readonly saleHomeAppRepository: SaleHomeAppRepository,
    private readonly optionService: OptionService,
    private readonly logger: LoggingService,
    private readonly mailService: MailService,
  ) {}

  // TODO: SIGHTSEEING
  async registerSightSeeing(dto: CreateHomeSightSeeingDto, userCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/registerSightSeeing:`;

    // kiểm tra homeCode
    const home = await this.saleHomeAppRepository.checkHomeExists(dto.homeCode);
    if (!home) {
      this.logger.error(logbase, `homeCode(${dto.homeCode}) -> ${Msg.HomeNotFound}`);
      throw new BadRequestException({ message: Msg.HomeNotFound, data: 0 });
    }

    // kiểm tra attendCode
    const attendCodes = await this.optionService.getAll({
      mainOption: OPTION_CONST.SIGHTSEEING.mainOption,
      subOption: OPTION_CONST.SIGHTSEEING.subOption,
    });

    if (!attendCodes.map((c) => c.code).includes(dto.numberAttendCode)) {
      throw new BadRequestException({ message: Msg.CodeInvalid, data: 0 });
    }

    // mặc định status ban đầu là  'Đang chờ duyệt'
    const result = await this.saleHomeSightseeingAppRepository.registerSightSeeing(dto, userCode, HomeSaleSightSeeingStatusEnum.WAITING);
    this.logger.log(logbase, `Đăng ký tham quan homeCode(${dto.homeCode}) -> ${result ? Msg.RegisterOk : Msg.RegisterErr}`);

    // sendEmail
    if (result) {
      const matchedAttend = attendCodes.find((c) => c.code === dto.numberAttendCode);
      const numberAttendText = matchedAttend ? matchedAttend.valueOption : dto.numberAttendCode;
      this.mailService.sendSightSeeingEmail({
        homeName: home.homeName,
        userName: dto.userName,
        userPhone: dto.userPhone,
        numberAttend: numberAttendText,
      });
    }

    return result;
  }
}
