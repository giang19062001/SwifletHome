import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { Msg } from 'src/helpers/message.helper';
import { YnEnum } from 'src/interfaces/admin.interface';
import { OPTION_CONST } from 'src/modules/options/option.interface';
import { OptionService } from 'src/modules/options/option.service';
import { TokenUserAppResDto } from '../../auth/app/auth.dto';
import { FetchSellingByEnum, MarkTypeEnum, RequestSellPriceOptionEnum } from '../qr.interface';
import { QrSellAppRepository } from './qr-sell.repository';
import { GetRequestSellListDto, InsertRequestSellDto } from './qr.dto';
import { GetRequestSellDetailResDto, GetRequestSellListResDto } from './qr.response';

@Injectable()
export class QrSellAppService {
  private readonly SERVICE_NAME = 'QrSellAppService';
  constructor(
    private readonly qrSellAppRepository: QrSellAppRepository,
    private readonly optionService: OptionService,
    private readonly logger: LoggingService,
  ) {}

  // TODO: SELL
  // lấy danh sách đăng bán
  async getRequestSellList(dto: GetRequestSellListDto, userCode: string, fetchBy: FetchSellingByEnum): Promise<{ total: number; list: GetRequestSellListResDto[] }> {
    const logbase = `${this.SERVICE_NAME}/getRequestSellList:`;
    const total = await this.qrSellAppRepository.getRequestSellTotal(dto, fetchBy, userCode);
    const rows = await this.qrSellAppRepository.getRequestSellList(dto, fetchBy, userCode);
    return { total: total, list: rows };
  }

  // lấy thông tin đăng bán chi tiết
  async getRequestSellDetail(requestCode: string, userCode: string, fetchBy: FetchSellingByEnum): Promise<GetRequestSellDetailResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getRequestSellDetail:`;
    // đánh dầu đã xem
    await this.maskRequestSell(requestCode, userCode, MarkTypeEnum.VIEW);
    const result = await this.qrSellAppRepository.getRequestSellDetail(requestCode, fetchBy);
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

      // Lấy tất cả các loại option cần thiết song song
      const [priceOptionCodes, ingredientNestOptionCodes] = await Promise.all([
        this.optionService.getAll({
          mainOption: OPTION_CONST.REQUSET_SELL.PRICE_OPTION.mainOption,
          subOption: OPTION_CONST.REQUSET_SELL.PRICE_OPTION.subOption,
        }),
        this.optionService.getAll({
          mainOption: OPTION_CONST.REQUSET_SELL.INGREDIENT_NEST.mainOption,
          subOption: OPTION_CONST.REQUSET_SELL.INGREDIENT_NEST.subOption,
        }),
      ]);

      // Kiểm tra priceOptionCode
      const priceOption = priceOptionCodes.find((c) => c.code.includes(dto.priceOptionCode));
      if (!priceOption) {
        this.logger.error(logbase, `${Msg.CodeInvalid} ---- priceOptionCode(${dto.priceOptionCode})`);
        return -2;
      }

      // kiểm tra priceForPurchaser và priceForEater theo priceOption.keyOption
      if (priceOption.keyOption === RequestSellPriceOptionEnum.SELL_FOR_PURCHASER) {
        if (dto.priceForPurchaser === null || dto.priceForPurchaser === undefined) {
          this.logger.error(logbase, `${Msg.InvalidPrice} ---- priceForPurchaser required`);
          return -4.1;
        }
        dto.priceForEater = null;
      } else if (priceOption.keyOption === RequestSellPriceOptionEnum.SELL_FOR_EATER) {
        if (dto.priceForEater === null || dto.priceForEater === undefined) {
          this.logger.error(logbase, `${Msg.InvalidPrice} ---- priceForEater required`);
          return -4.2;
        }
        dto.priceForPurchaser = null;
      } else if (priceOption.keyOption === RequestSellPriceOptionEnum.BOTH) {
        if (dto.priceForPurchaser === null || dto.priceForPurchaser === undefined || dto.priceForEater === null || dto.priceForEater === undefined) {
          this.logger.error(logbase, `${Msg.InvalidPrice} ---- both priceForPurchaser and priceForEater required`);
          return -4.3;
        }
      }

      // Kiểm tra ingredientNestOptionCode
      if (!ingredientNestOptionCodes.map((c) => c.code).includes(dto.ingredientNestOptionCode)) {
        this.logger.error(logbase, `${Msg.CodeInvalid} ---- ingredientNestOptionCode(${dto.ingredientNestOptionCode})`);
        return -2;
      }

      const result = await this.qrSellAppRepository.insertRequestSell(user.userCode, dto);
      return result;
    } catch (error) {
      this.logger.error(logbase, error);
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
