import { Controller, Post, Body, HttpStatus, Get, HttpCode, UseGuards, Put, Param, BadRequestException, UseInterceptors, UseFilters, UploadedFile, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ListResponseDto, NullResponseDto, NumberOkResponseDto } from 'src/dto/common.dto';
import { QrAppService } from './qr.service';
import {
  GetApprovedRequestQrCodeResDto,
  GetInfoToRequestQrcodeResDto,
  GetRequestQrCodeListResDto,
  GetRequestSellDetailResDto,
  GetRequestSellListResDto,
  UploadRequestVideoResDto,
} from './qr.response';
import { GetRequestSellListDto, InsertRequestSellDto, MaskRequestSellDto, RequestQrCodeDto, UploadRequestVideoDto } from './qr.dto';
import { GetUserApp } from 'src/decorator/auth.decorator';
import * as authInterface from 'src/modules/auth/app/auth.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterBadRequestFilter } from 'src/filter/uploadError.filter';
import { multerVideoConfig } from 'src/config/multer.config';
import { Msg } from 'src/helpers/message.helper';
import { USER_CONST } from 'src/modules/user/app/user.interface';
import { GetTypeEnum } from '../qr.interface';
import { PagingDto } from 'src/dto/admin.dto';

@ApiTags('app/qr')
@Controller('/api/app/qr')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export default class QrAppController {
  constructor(private readonly qrAppService: QrAppService) {}

  @ApiOperation({
    summary: 'Lấy danh sách  yêu cầu qrcode của user hiện tại',
    description: ``,
  })
  @Post('getRequestQrCocdeList')
  @ApiBody({
    type: PagingDto,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ListResponseDto(GetRequestQrCodeListResDto)) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getRequestQrCocdeList(@Body() dto: PagingDto, @GetUserApp() user: authInterface.ITokenUserApp) {
    const result = await this.qrAppService.getRequestQrCocdeList(user, dto);
    return result;
  }

  @ApiOperation({
    summary: 'Lấy thông tin Qrcode đã được ADMIN chấp thuận từ yêu cầu tạo mã Qrcode trước đó',
    description: ``,
  })
  @Get('getApprovedRequestQrCocde/:requestCode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetApprovedRequestQrCodeResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getApprovedRequestQrCocde(@Param('requestCode') requestCode: string, @GetUserApp() user: authInterface.ITokenUserApp) {
    const result = await this.qrAppService.getApprovedRequestQrCocde(requestCode, user);
    return result;
  }

  @ApiOperation({
    summary: 'Lấy thông tin để yêu cầu tạo mã Qrcode',
    description: ``,
  })
  @Get('getInfoToRequestQrcode/:userHomeCode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetInfoToRequestQrcodeResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getInfoToRequestQrcode(@Param('userHomeCode') userHomeCode: string, @GetUserApp() user: authInterface.ITokenUserApp) {
    const result = await this.qrAppService.getInfoToRequestQrcode(userHomeCode, user, 0);
    return result;
  }

  @ApiOperation({
    summary: 'Tạo yêu cầu tạo mã Qrcode',
  })
  @Post('requestQrCode')
  @ApiBody({
    type: RequestQrCodeDto,
    description: `
  **uniqueId**  là giá trị **uuid** được generate phía app\n
  **userName** là tên chủ\n
  **userHomeCode** là mã code nhà yến\n
  **harvestPhase** là **Int** đợt thu hoạch ( Gía trị minimun là 1 )\n
    `,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  async requestQrCode(@GetUserApp() user: authInterface.ITokenUserApp, @Body() dto: RequestQrCodeDto) {
    const result = await this.qrAppService.requestQrCode(user, dto);
    if (result === -1) {
      throw new BadRequestException({
        message: Msg.UuidNotFound,
        data: 0,
      });
    }
    if (result === -2) {
      throw new BadRequestException({
        message: Msg.RequestQrcodeAlreadyExsist,
        data: 0,
      });
    }
    if (result === -3) {
      throw new BadRequestException({
        message: Msg.RequestNotAllowHarvestEmpty,
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

  @ApiOperation({
    summary: 'Hủy yêu cầu qrcode',
  })
  @Put('cancelRequest/:requestCode')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'requestCode', type: String })
  @ApiOkResponse({ type: NumberOkResponseDto })
  async cancelRequest(@Param('requestCode') requestCode: string, @GetUserApp() user: authInterface.ITokenUserApp): Promise<number> {
    const result = await this.qrAppService.cancelRequest(requestCode, user.userCode);
    if (result === 0) {
      throw new BadRequestException({
        message: Msg.UpdateErr,
        data: 0,
      });
    }

    return result;
  }

  // TODO: FILE
  @ApiOperation({
    summary: 'Dùng cho nút UPLOAD quy trình chế biến đóng gói ',
  })
  @Post('uploadRequestVideo')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadRequestVideoDto,
  })
  @UseFilters(MulterBadRequestFilter)
  @UseInterceptors(FileInterceptor('requestQrcodeVideo', multerVideoConfig))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(UploadRequestVideoResDto) })
  async uploadRequestVideo(@GetUserApp() user: authInterface.ITokenUserApp, @Body() dto: UploadRequestVideoDto, @UploadedFile() requestQrcodeVideo: Express.Multer.File) {
    const result = await this.qrAppService.uploadRequestVideo(user.userCode, dto, requestQrcodeVideo);
    return {
      message: result.filename != '' ? Msg.UploadOk : Msg.UploadErr,
      data: result,
    };
  }

  // TODO: SELL
  @ApiOperation({
    summary: `Lấy chi tiết 1 yêu cầu bán tổ yến`,
    description: ``,
  })
  @Get('getRequestSellDetail/:requestCode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetRequestSellDetailResDto) })
  async getRequestSellDetail(@GetUserApp() user: authInterface.ITokenUserApp, @Param('requestCode') requestCode: string) {
    const result = await this.qrAppService.getRequestSellDetail(requestCode);
    return result;
  }

  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu bán tổ yến',
    description: `
  **getType**: enum('ALL', 'VIEW', 'SAVE')\n
  *ALL*: lấy tất cả \n
  *VIEW*: lấy các dữ liệu đã xem \n
  *SAVE*: lấy các dữ liệu đã lưu \n
    `,
  })
  @Post('getRequestSellList')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: GetRequestSellListDto,
  })
  @ApiOkResponse({ type: ApiAppResponseDto(ListResponseDto(GetRequestSellListResDto)) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getRequestSellList(@Body() dto: GetRequestSellListDto, @GetUserApp() user: authInterface.ITokenUserApp) {
    if (user.userTypeKeyWord !== USER_CONST.USER_TYPE.PURCHASER.value) {
      throw new BadRequestException({
        message: Msg.OnlyPurcharseCanFetch,
        data: [],
      });
    }
    const result = await this.qrAppService.getRequestSellList(dto, user.userCode);
    return result;
  }

  @ApiOperation({
    summary: 'Tạo yêu cầu cần bán sản lượng yến ',
  })
  @Post('requestSell')
  @ApiBody({
    type: InsertRequestSellDto,
    description: `
  **requestCode**  Mã code của yêu cầu QrCode ở màn hình hiện tại\n
  **userName** là tên chủ\n
  **userPhone** là Số Điện Thoại\n
  **priceOptionCode** là mã Code lấy từ API api/app/options/getAll {"mainOption": "REQUSET_SELL", "subOption": "PRICE_OPTION"} - Chỉ chọn 1 \n
  **pricePerKg** (Number) là đon giá theo kg\n
  **volumeForSell** (Number) là khối lượng cần bán\n
  **nestQuantity** (Number) là Số lượng tổ\n
  **humidity** (Number) là Độ ẩm tổ Yến\n
  **ingredientNestOptionCode**  là mã Code lấy từ API api/app/options/getAll {"mainOption": "REQUSET_SELL", "subOption": "INGREDIENT_NEST"} - Chỉ chọn 1 
    `,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  async requestSell(@GetUserApp() user: authInterface.ITokenUserApp, @Body() dto: InsertRequestSellDto) {
    const result = await this.qrAppService.requestSell(user, dto);
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

  // TODO: SELL-INTERACT
  @ApiOperation({
    summary: `Đánh dấu 1 'yêu cầu bán' là đã xem hay là lưu `,
    description: `
  **markType**: enum('VIEW', 'SAVE')\n
  *VIEW*: dùng khi click vào 1 'yêu cầu bán tổ yến' nào đó  \n
  *SAVE*: dùng khi click nút lưu của 1 'yêu cầu bán tổ yến' nào đó \n
  `,
  })
  @Put('maskRequestSell/:requestCode')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: MaskRequestSellDto,
  })
  @ApiOkResponse({ type: NumberOkResponseDto })
  async maskRequestSell(@GetUserApp() user: authInterface.ITokenUserApp, @Param('requestCode') requestCode: string, @Body() dto: MaskRequestSellDto) {
    const result = await this.qrAppService.maskRequestSell(requestCode, user.userCode, dto.markType);
    return result;
  }
}
