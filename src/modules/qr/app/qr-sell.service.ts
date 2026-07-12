import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { PagingDto } from 'src/dto/admin.dto';
import { Msg } from 'src/helpers/message.helper';
import { YnEnum } from 'src/interfaces/admin.interface';
import { InfoAppService } from 'src/modules/info/app/info.service';
import { OPTION_CONST } from 'src/modules/options/option.const';
import { OptionService } from 'src/modules/options/option.service';
import { TokenUserAppResDto } from '../../auth/app/auth.response';
import { FetchSellingByEnum, MarkTypeEnum, RequestSellPriceOptionEnum } from '../common/qr.enum';
import { QrSellAppRepository } from './qr-sell.repository';
import { GetSellingForPurchaserListDto, InsertRequestSellDto } from './qr.dto';
import { GetSellingDetailResDto, GetSellingListResDto, PriceVatHistoryDto } from './qr.response';

@Injectable()
export class QrSellAppService {
  private readonly SERVICE_NAME = 'QrSellAppService';
  constructor(
    private readonly qrSellAppRepository: QrSellAppRepository,
    private readonly optionService: OptionService,
    private readonly infoAppService: InfoAppService,
    private readonly logger: LoggingService,
  ) {}

  // TODO: SELL FOR PURCHASER
  // lấy danh sách đăng bán
  async getSellingForPurchaserList(dto: GetSellingForPurchaserListDto, userCode: string, fetchBy: FetchSellingByEnum): Promise<{ total: number; list: GetSellingListResDto[] }> {
    const logbase = `${this.SERVICE_NAME}/getSellingForPurchaserList:`;
    const total = await this.qrSellAppRepository.getSellingForPurchaserTotal(dto, fetchBy, userCode);
    const rows = await this.qrSellAppRepository.getSellingForPurchaserList(dto, fetchBy, userCode);
    return { total: total, list: rows };
  }

  // lấy thông tin đăng bán chi tiết
  async getSellingForPurchaserDetail(requestCode: string, userCode: string, fetchBy: FetchSellingByEnum): Promise<GetSellingDetailResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getSellingForPurchaserDetail:`;
    // đánh dầu đã xem
    await this.maskRequestSell(requestCode, userCode, MarkTypeEnum.VIEW);
    const result = await this.qrSellAppRepository.GetSellingDetail(requestCode, fetchBy);
    return result;
  }

  // TODO: SELL FOR EATER
  // lấy danh sách đăng bán
  async getSellingForEaterList(dto: PagingDto, fetchBy: FetchSellingByEnum): Promise<{ total: number; list: GetSellingListResDto[] }> {
    const logbase = `${this.SERVICE_NAME}/getSellingForEaterList:`;
    const total = await this.qrSellAppRepository.getSellingForEaterTotal(fetchBy);
    const rows = await this.qrSellAppRepository.getSellingForEaterList(dto, fetchBy);
    return { total: total, list: rows };
  }

  // lấy thông tin đăng bán chi tiết
  async getSellingForEaterDetail(requestCode: string, fetchBy: FetchSellingByEnum): Promise<GetSellingDetailResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getSellingForEaterDetail:`;
    const result = await this.qrSellAppRepository.GetSellingDetail(requestCode, fetchBy);
    return result;
  }

  // TODO: SELL
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

      // Lấy VAT từ InfoAppService
      // const vatInfo = await this.infoAppService.getDetail('VAT');
      // const vat = vatInfo && vatInfo.infoContent && typeof vatInfo.infoContent === 'object' && 'vat' in vatInfo.infoContent ? Number(vatInfo.infoContent.vat) : 0;

      const priceVatHistory: PriceVatHistoryDto = {};

      // KO TÍNH VAT NỮA
      // if (dto.priceForPurchaser !== null && dto.priceForPurchaser !== undefined) {
      //   const finalPrice = dto.priceForPurchaser * (1 + vat / 100);
      //   priceVatHistory.priceForPurchaser = {
      //     priceForPurchaser: dto.priceForPurchaser,
      //     vat: vat,
      //     finalPrice: finalPrice,
      //   };
      //   dto.priceForPurchaser = finalPrice;
      // }

      // if (dto.priceForEater !== null && dto.priceForEater !== undefined) {
      //   const finalPrice = dto.priceForEater * (1 + vat / 100);
      //   priceVatHistory.priceForEater = {
      //     priceForEater: dto.priceForEater,
      //     vat: vat,
      //     finalPrice: finalPrice,
      //   };
      //   dto.priceForEater = finalPrice;
      // }

      const result = await this.qrSellAppRepository.insertRequestSell(user.userCode, dto, priceVatHistory);
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
