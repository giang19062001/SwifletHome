import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { Msg } from 'src/helpers/message.helper';
import { OPTION_CONST } from 'src/modules/options/option.interface';
import { OptionService } from 'src/modules/options/option.service';
import { GetAllConsignmentDto, RequestConsigmentDto } from './consigment.dto';
import { ConsignmentAppRepository } from './consigment.repository';
import { ConsignmentResDto } from './consignment.response';

@Injectable()
export class ConsignmentAppService {
  private readonly SERVICE_NAME = 'ConsignmentAppService';

  constructor(
    private readonly consignmentAppRepository: ConsignmentAppRepository,
    private readonly optionService: OptionService,
    private readonly logger: LoggingService,
  ) {}

  async requestConsigment(userCode: string, dto: RequestConsigmentDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/requestConsigment:`;

    try {
      // kiểm tra nestType
      const nestTypeCodes = await this.optionService.getAll({
        mainOption: OPTION_CONST.CONSIGNMENT_NEST.NEST_TYPE.mainOption,
        subOption: OPTION_CONST.CONSIGNMENT_NEST.NEST_TYPE.subOption,
      });

      if (!nestTypeCodes.map((c) => c.code).includes(dto.nestType)) {
        this.logger.error(logbase, `${Msg.CodeInvalid} ---- nestType(${dto.nestType})`);
        return -1;
      }

      const result = await this.consignmentAppRepository.requestConsigment(userCode, dto);
      this.logger.log(logbase, `Yêu cầu ký gửi cho người dùng(${userCode}) thành công`);
      return result;
    } catch (error) {
      this.logger.error(logbase, JSON.stringify(error));
      return 0;
    }
  }
  async GetAllConsignment(dto: GetAllConsignmentDto, userCode: string): Promise<{ total: number; list: ConsignmentResDto[] }> {
    const logbase = `${this.SERVICE_NAME}/GetAllConsignment:`;

    const total = await this.consignmentAppRepository.getTotal(dto, userCode);
    const list = await this.consignmentAppRepository.getAll(dto, userCode);
    this.logger.log(logbase, `total(${total})`);

    return { total, list };
  }
}
