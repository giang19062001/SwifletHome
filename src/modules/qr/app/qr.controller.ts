import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, UploadedFiles, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { getImgVideoMulterConfig } from 'src/config/multer.config';
import { GetEaterApp, GetUserApp } from 'src/decorator/auth.decorator';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ListResponseDto, NullResponseDto, NumberOkResponseDto } from 'src/dto/common.dto';
import { MulterBadRequestFilter } from 'src/filter/uploadError.filter';
import { Msg } from 'src/helpers/message.helper';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { TokenEaterAppResDto, TokenUserAppResDto } from 'src/modules/auth/app/auth.dto';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { USER_CONST } from 'src/modules/user/app/user.interface';
import { FetchSellingByEnum } from '../qr.interface';
import { QrRequestAppService } from './qr-request.service';
import { QrSellAppService } from './qr-sell.service';
import { VideoConverterInterceptor } from 'src/interceptors/video-converter.interceptor';
import { GetSellingForPurchaserListDto, MaskRequestSellDto, RequestQrCodeDto, UploadRequestVideoDto } from './qr.dto';
import {
  GetApprovedRequestQrCodeResDto,
  GetInfoToRequestQrcodeResDto,
  GetRequestQrCodeDetailResDto,
  GetRequestQrCodeListResDto,
  GetSellingDetailResDto,
  GetSellingListResDto,
  UploadRequestVideoResDto,
  ValidateHarvestItemResDto,
} from './qr.response';

@ApiTags('app/qr')
@Controller('/api/app/qr')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export default class QrAppController {
  constructor(
    private readonly qrRequestAppService: QrRequestAppService,
    private readonly qrSellAppService: QrSellAppService,
  ) {}

  // TODO: QR FETCH
  // Lấy danh sách yêu cầu cung cấp mã QR
  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu cung cấp mã QR',
    description: ``,
  })
  @Post('getRequestQrCocdeList')
  @ApiBody({
    type: PagingDto,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ListResponseDto(GetRequestQrCodeListResDto)) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getRequestQrCocdeList(@Body() dto: PagingDto, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.qrRequestAppService.getRequestQrCocdeList(user, dto);
    return result;
  }

  // Lấy thông tin Qrcode đã được ADMIN chấp thuận
  @ApiOperation({
    summary: 'Lấy thông tin Qrcode đã được ADMIN chấp thuận',
    description: ``,
  })
  @Get('getApprovedRequestQrCocde/:requestCode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetApprovedRequestQrCodeResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getApprovedRequestQrCocde(@Param('requestCode') requestCode: string, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.qrRequestAppService.getApprovedRequestQrCocde(requestCode, user);
    if (!result) {
      throw new BadRequestException({
        message: Msg.ThisQrNotApproved,
        data: null,
      });
    }
    return result;
  }

  // Lấy toàn bộ thông tin Qrcode + thông tin đăng bán sản lượng yến liên kết với mã Qrcode - dành cho chủ nhà yến
  @ApiOperation({
    summary: 'Lấy toàn bộ thông tin Qrcode + thông tin đăng bán sản lượng yến liên kết với mã Qrcode - dành cho chủ nhà yến',
    description: ``,
  })
  @Get('getRequestQrCodeDetail/:requestCode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetRequestQrCodeDetailResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getRequestQrCodeDetail(@Param('requestCode') requestCode: string, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.qrRequestAppService.getRequestQrCodeDetail(requestCode, user);
    if (!result) {
      throw new BadRequestException({
        message: Msg.ThisQrNotApproved,
        data: null,
      });
    }
    return result;
  }

  // Lấy thông tin ( NHÀ YẾN, LĂN THUỐC, THU HOẠCH ) để hiển thị dữ liệu lên màn hình trước khi yêu cầu tạo mã Qrcode
  @ApiOperation({
    summary: 'Lấy thông tin NHÀ YẾN, LĂN THUỐC, THU HOẠCH để hiển thị dữ liệu lên màn hình trước khi yêu cầu tạo mã Qrcode',
    description: ``,
  })
  @Get('getInfoToRequestQrcode/:userHomeCode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetInfoToRequestQrcodeResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getInfoToRequestQrcode(@Param('userHomeCode') userHomeCode: string, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.qrRequestAppService.getInfoToRequestQrcode(userHomeCode, user, 0);
    return result;
  }

  // Kiểm tra số lượng đợt thu hoạch khả dụng của các nhà yến trước vào màn hình khi yêu cầu QR
  @ApiOperation({
    summary: 'Kiểm tra số lượng đợt thu hoạch khả dụng của các nhà yến trước vào màn hình khi yêu cầu QR',
    description: ``,
  })
  @Get('validateHarvestBeforeRequestQr')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ListResponseDto(ValidateHarvestItemResDto)) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async validateHarvestBeforeRequestQr(@GetUserApp() user: TokenUserAppResDto): Promise<{ total: number; list: ValidateHarvestItemResDto[] }> {
    const result = await this.qrRequestAppService.validateHarvestBeforeRequestQr(user.userCode);
    return result;
  }

  // TODO: QR CRUD
  // Tạo yêu cầu cung cấp mã QR
  @ApiOperation({
    summary: 'Tạo yêu cầu cung cấp mã Qrcode',
  })
  @Post('requestQrCode')
  @ApiBody({
    type: RequestQrCodeDto,
    description: `
  **uniqueId**  là giá trị **uuid** được generate phía app\n
  **userName** là tên chủ\n
  **userHomeCode** là mã code nhà yến\n
  **harvestPhase** là **Int** đợt thu hoạch ( Giá trị minimun là 1 )\n
    `,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  async requestQrCode(@GetUserApp() user: TokenUserAppResDto, @Body() dto: RequestQrCodeDto) {
    const result = await this.qrRequestAppService.requestQrCode(user, dto);
    if (result === -1) {
      throw new BadRequestException({
        message: Msg.UuidNotFound,
        data: 0,
      });
    }
    if (result === -2) {
      throw new BadRequestException({
        message: Msg.ThisHarvestRequestQrcodeAlready,
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
        message: Msg.createQrRequestErr,
        data: 0,
      });
    }
    return {
      message: Msg.createQrRequestOk,
      data: result,
    };
  }

  // Hủy yêu cầu cung cấp mã QR
  @ApiOperation({
    summary: 'Hủy yêu cầu cung cấp mã Qrcode',
  })
  @Put('cancelRequest/:requestCode')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'requestCode', type: String })
  @ApiOkResponse({ type: NumberOkResponseDto })
  async cancelRequest(@Param('requestCode') requestCode: string, @GetUserApp() user: TokenUserAppResDto): Promise<number> {
    const result = await this.qrRequestAppService.cancelRequest(requestCode, user.userCode);
    if (result === 0) {
      throw new BadRequestException({
        message: Msg.UpdateErr,
        data: 0,
      });
    }

    return result;
  }

  // TODO: QR FILE
  // Upload files quy trình chế biến đóng gói
  @ApiOperation({
    summary: 'Upload files quy trình chế biến đóng gói',
  })
  @Post('uploadRequestFile')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadRequestVideoDto,
  })
  @UseFilters(MulterBadRequestFilter)
  @UseInterceptors(FilesInterceptor('requestQrcodeFiles', 5, getImgVideoMulterConfig(5)), VideoConverterInterceptor)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto([UploadRequestVideoResDto]) })
  async uploadRequestFile(@GetUserApp() user: TokenUserAppResDto, @Body() dto: UploadRequestVideoDto, @UploadedFiles() requestQrcodeFiles: Express.Multer.File[]) {
    const result = await this.qrRequestAppService.uploadRequestFile(user.userCode, dto, requestQrcodeFiles);
    return {
      message: result.length ? Msg.UploadOk : Msg.UploadErr,
      data: result,
    };
  }

  // TODO: SELL FOR PURCHASER
  @ApiOperation({
    summary: `Lấy toàn bộ thông tin Qrcode + thông tin đăng bán sản lượng yến liên kết với mã Qrcode - dành cho nhà thu mua`,
    description: `
  **priceForPurchaser** (Number | null) Giá bán dành cho nhà thu mua\n
  **priceForEater** (Number | null) Giá bán dành cho người ăn yến\n
    `,
  })
  @Get('getSellingForPurchaserDetail/:requestCode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetSellingDetailResDto) })
  async getSellingForPurchaserDetail(@GetUserApp() user: TokenUserAppResDto, @Param('requestCode') requestCode: string) {
    const result = await this.qrSellAppService.getSellingForPurchaserDetail(requestCode, user.userCode, user.userTypeKeyWord as FetchSellingByEnum);
    return result;
  }

  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu bán sản lượng yến liên kết với mã Qrcode - dành cho nhà thu mua',
    description: `
  **getType**: enum('ALL', 'VIEW', 'SAVE')\n
  *ALL*: lấy tất cả \n
  *VIEW*: lấy các dữ liệu đã xem \n
  *SAVE*: lấy các dữ liệu đã lưu \n
    `,
  })
  @Post('getSellingForPurchaserList')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: GetSellingForPurchaserListDto,
  })
  @ApiOkResponse({ type: ApiAppResponseDto(ListResponseDto(GetSellingListResDto)) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getSellingForPurchaserList(@Body() dto: GetSellingForPurchaserListDto, @GetUserApp() user: TokenUserAppResDto) {
    if (user.userTypeKeyWord !== USER_CONST.USER_TYPE.PURCHASER.value) {
      throw new BadRequestException({
        message: Msg.OnlyPurcharseCanFetch,
        data: null,
      });
    }
    const result = await this.qrSellAppService.getSellingForPurchaserList(dto, user.userCode, user.userTypeKeyWord as FetchSellingByEnum);
    return result;
  }

  // TODO: SELL FOR PURCHASER
  @ApiOperation({
    summary: `Lấy toàn bộ thông tin Qrcode + thông tin đăng bán sản lượng yến liên kết với mã Qrcode - dành cho nhà thu mua`,
    description: `
  **priceForPurchaser** (Number | null) Giá bán dành cho nhà thu mua\n
  **priceForEater** (Number | null) Giá bán dành cho người ăn yến\n
    `,
  })
  @Get('getSellingForEaterDetail/:requestCode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetSellingDetailResDto) })
  async getSellingForEaterDetail(@GetEaterApp() eater: TokenEaterAppResDto, @Param('requestCode') requestCode: string) {
    const result = await this.qrSellAppService.getSellingForEaterDetail(requestCode, eater.userTypeKeyWord as FetchSellingByEnum);
    return result;
  }

  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu bán sản lượng yến liên kết với mã Qrcode - dành cho người ăn yến',
    description: ``,
  })
  @Post('getSellingForEaterList')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: PagingDto,
  })
  @ApiOkResponse({ type: ApiAppResponseDto(ListResponseDto(GetSellingListResDto)) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getSellingForEaterList(@Body() dto: PagingDto, @GetEaterApp() eater: TokenEaterAppResDto) {
    if (eater.userTypeKeyWord !== USER_CONST.USER_TYPE.EATER.value) {
      throw new BadRequestException({
        message: Msg.OnlyEaterCanFetch,
        data: null,
      });
    }
    const result = await this.qrSellAppService.getSellingForEaterList(dto, eater.userTypeKeyWord as FetchSellingByEnum);
    return result;
  }

  // TODO: SELL-INTERACT
  @ApiOperation({
    summary: `Đánh dấu 1 'đơn đăng bán bán sản lượng yến liên kết với mã QR' là đã 'XEM' hay là 'LƯU' `,
    description: `
  **markType**: enum('VIEW', 'SAVE')\n
  *VIEW*: dùng khi click vào 1 'yêu cầu bán sản lượng yến' nào đó  \n
  *SAVE*: dùng khi click nút lưu của 1 'yêu cầu sản lượng yến' nào đó \n
  `,
  })
  @Put('maskRequestSell/:requestCode')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: MaskRequestSellDto,
  })
  @ApiOkResponse({ type: NumberOkResponseDto })
  async maskRequestSell(@GetUserApp() user: TokenUserAppResDto, @Param('requestCode') requestCode: string, @Body() dto: MaskRequestSellDto) {
    const result = await this.qrSellAppService.maskRequestSell(requestCode, user.userCode, dto.markType);
    return result;
  }
}
