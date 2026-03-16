import { BadRequestException, Injectable } from '@nestjs/common';
import { HomeSaleSightSeeingStatusEnum } from '../homeSale.interface';
import { CreateHomeSightSeeingDto } from './homeSale.dto';
import { Msg } from 'src/helpers/message.helper';
import { OptionService } from 'src/modules/options/option.service';
import { LoggingService } from 'src/common/logger/logger.service';
import { OPTION_CONST } from 'src/modules/options/option.interface';
import { HomeSaleSightseeingAppRepository } from './homeSale-sightseeing.repository';
import { HomeSaleIndexAppRepository } from './homeSale-index.repository';

@Injectable()
export class HomeSaleSightseeingAppService {
  private readonly SERVICE_NAME = 'HomeSaleSightseeingAppService';
  constructor(
    private readonly homeSaleSightseeingAppRepository: HomeSaleSightseeingAppRepository,
    private readonly homeSaleIndexAppRepository: HomeSaleIndexAppRepository,
    private readonly optionService: OptionService,
    private readonly logger: LoggingService,
  ) {}
  // TODO: SIGHTSEEING
  async registerSightSeeing(dto: CreateHomeSightSeeingDto, userCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/registerSightSeeing:`;

    // kiểm tra homeCode
    const home = await this.homeSaleIndexAppRepository.getDetail(dto.homeCode);
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
    const result = await this.homeSaleSightseeingAppRepository.registerSightSeeing(dto, userCode, HomeSaleSightSeeingStatusEnum.WAITING);
    this.logger.log(logbase, `homeCode(${dto.homeCode}) -> ${result ? Msg.RegisterOk : Msg.RegisterErr}`);

    return result;
  }
}
