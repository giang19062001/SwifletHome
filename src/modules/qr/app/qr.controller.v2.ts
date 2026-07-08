import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { NumberOkResponseDto } from 'src/dto/common.dto';
import { Msg, MsgDto } from 'src/helpers/message.helper';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { TokenUserAppResDto } from "../../auth/app/auth.response";
import { QrSellAppService } from './qr-sell.service';
import { InsertRequestSellDto } from './qr.dto';

@ApiTags('app/qr')
@Controller('/api/app/v2/qr')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export default class QrAppV2Controller {
  constructor(private readonly qrSellAppService: QrSellAppService) {}

  @ApiOperation({
    summary: 'Tạo yêu cầu cần bán sản lượng yến sau khi mã QRcode đã được tạo và được ADMIN duyệt',
  })
  @Post('requestSell')
  @ApiBody({
    type: InsertRequestSellDto,
    description: `
  **requestCode**  Mã code của yêu cầu QrCode ở màn hình hiện tại\n
  **userName** là tên chủ\n
  **userPhone** là Số Điện Thoại\n
  **priceOptionCode** là mã Code lấy từ API api/app/options/getAll {"mainOption": "REQUSET_SELL", "subOption": "PRICE_OPTION"} - Chỉ chọn 1 \n
  **pricePerKg** (Number) ⚠️ ĐÃ BỊ LOẠI BỎ - GIÁ TRỊ NÀY TỪ GIỜ SẼ ĐƯỢC SET CỨNG LÀ 0 \n
  **priceForPurchaser** (Number | null) 🆕 Giá bán dành cho nhà thu mua - Khi **priceOption.keyOption** là 'SELL_FOR_PURCHASER' hoặc 'BOTH' thì **priceForPurchaser** bắt buộc phải có giá trị\n
  **priceForEater** (Number | null) 🆕 Giá bán dành cho người ăn yến - Khi **priceOption.keyOption** là 'SELL_FOR_EATER' hoặc 'BOTH' thì **priceForEater** bắt buộc phải có giá trị\n
  **volumeForSell** (Number) là khối lượng cần bán\n
  **nestQuantity** (Number) là Số lượng tổ\n
  **humidity** (Number) là Độ ẩm tổ Yến\n
  **ingredientNestOptionCode**  là mã Code lấy từ API api/app/options/getAll {"mainOption": "REQUSET_SELL", "subOption": "INGREDIENT_NEST"} - Chỉ chọn 1 \n
    `,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  async requestSell(@GetUserApp() user: TokenUserAppResDto, @Body() dto: InsertRequestSellDto) {
    const result = await this.qrSellAppService.requestSell(user, dto);
    if (result === -1) {
      throw new BadRequestException({
        message: Msg.RequestQrcodeNotFound,
        data: 0,
      });
    }
    if (result === -2) {
      throw new BadRequestException({
        message: Msg.CodeInvalid,
        data: 0,
      });
    }
    if (result === -3) {
      throw new BadRequestException({
        message: Msg.RequestInfoAlreadySold,
        data: 0,
      });
    }
    if (result === -4.1) {
      throw new BadRequestException({
        message: MsgDto.CannotNull('priceForPurchaser'),
        data: 0,
      });
    }
    if (result === -4.2) {
      throw new BadRequestException({
        message: MsgDto.CannotNull('priceForEater'),
        data: 0,
      });
    }
    if (result === -4.3) {
      throw new BadRequestException({
        message: MsgDto.CannotNull('priceForPurchaser_priceForEater'),
        data: 0,
      });
    }
    if (result === 0) {
      throw new BadRequestException({
        message: Msg.CreateErr,
        data: 0,
      });
    }
    return {
      message: Msg.CreateOk,
      data: result,
    };
  }
}
