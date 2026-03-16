import { MarkTypeEnum } from '../qr.interface';
import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { GetRequestSellDetailResDto, GetRequestSellListResDto } from './qr.response';
import { GetRequestSellListDto, InsertRequestSellDto } from './qr.dto';
import { Msg } from 'src/helpers/message.helper';
import { OPTION_CONST, RequestSellPriceOptionEnum } from 'src/modules/options/option.interface';
import { OptionService } from 'src/modules/options/option.service';
import { YnEnum } from 'src/interfaces/admin.interface';
import { TokenUserAppResDto } from '../../auth/app/auth.dto';
import { QrSellAppRepository } from './qr-sell.repository';

@Injectable()
export class QrSellAppService {
  private readonly SERVICE_NAME = 'QrSellAppService';
  constructor(
    private readonly qrSellAppRepository: QrSellAppRepository,
    private readonly optionService: OptionService,
    private readonly logger: LoggingService,
  ) {}

  // TODO: SELL
  async getRequestSellList(dto: GetRequestSellListDto, userCode: string): Promise<{ total: number; list: GetRequestSellListResDto[] }> {
    const logbase = `${this.SERVICE_NAME}/getRequestSellList:`;
    const total = await this.qrSellAppRepository.getRequestSellTotal(dto, userCode);
    const rows = await this.qrSellAppRepository.getRequestSellList(dto, userCode);
    return { total: total, list: rows };
  }

  async getRequestSellDetail(requestCode: string, userCode: string): Promise<GetRequestSellDetailResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getRequestSellList:`;
    // đánh dầu đã xem
    await this.maskRequestSell(requestCode, userCode, MarkTypeEnum.VIEW);
    const result = await this.qrSellAppRepository.getRequestSellDetail(requestCode);
    return result;
  }

  async requestSell(user: TokenUserAppResDto, dto: InsertRequestSellDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/insertRequestSell:`;

    try {
      // kiểm tra thông tin qr
      const getRequestQrInfo = await this.qrSellAppRepository.checkIsApprovedAndIsSold(dto.requestCode);
      if (!getRequestQrInfo) {
        this.logger.error(logbase, `${Msg.RequestQrcodeNotFound} ---- requestCode(${dto.requestCode})`);
        return -1;
      }

      if (getRequestQrInfo.isSold === YnEnum.Y) {
        this.logger.error(logbase, `${Msg.RequestInfoAlreadySold} ---- requestCode(${dto.requestCode})`);
        return -3;
      }

      // kiểm tra priceOptionCode
      const priceOptionCodes = await this.optionService.getAll({
        mainOption: OPTION_CONST.REQUSET_SELL.PRICE_OPTION.mainOption,
        subOption: OPTION_CONST.REQUSET_SELL.PRICE_OPTION.subOption,
      });

      const priceOption = priceOptionCodes.find((c) => c.code.includes(dto.priceOptionCode));
      if (!priceOption) {
        this.logger.error(logbase, `${Msg.CodeInvalid} ---- priceOptionCode(${dto.priceOptionCode})`);
        return -2;
      }

      // trường hợp 'giá thương lượng' thì 'pricePerKg' cho là 0
      if (priceOption.keyOption == RequestSellPriceOptionEnum.NEGOTIATE) {
        dto.pricePerKg = 0;
      }

      // kiểm tra ingredientNestOptionCode
      const ingredientNestOptionCodes = await this.optionService.getAll({
        mainOption: OPTION_CONST.REQUSET_SELL.INGREDIENT_NEST.mainOption,
        subOption: OPTION_CONST.REQUSET_SELL.INGREDIENT_NEST.subOption,
      });

      if (!ingredientNestOptionCodes.map((c) => c.code).includes(dto.ingredientNestOptionCode)) {
        this.logger.error(logbase, `${Msg.CodeInvalid} ---- ingredientNestOptionCode(${dto.ingredientNestOptionCode})`);
        return -2;
      }
      const result = await this.qrSellAppRepository.insertRequestSell(user.userCode, dto);

      return result;
    } catch (error) {
      this.logger.error(logbase, JSON.stringify(error));
      return 0;
    }
  }

  // TODO: SELL-INTERACT
  async maskRequestSell(requestCode: string, userCode: string, markType: MarkTypeEnum): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/maskRequestSell:`;
    const result = await this.qrSellAppRepository.maskRequestSell(requestCode, userCode, markType);
    return result;
  }
}
