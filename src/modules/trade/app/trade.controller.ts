import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UploadedFile, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { multerImgConfig } from 'src/config/multer.config';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { NumberOkResponseDto } from 'src/dto/common.dto';
import { MulterBadRequestFilter } from 'src/filter/uploadError.filter';
import { Msg } from 'src/helpers/message.helper';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { TokenUserAppResDto } from 'src/modules/auth/app/auth.response';
import { CreateTradeDto, GetTradeListDto, TradeInteractDto, UploadTradeImageDto } from './trade.dto';
import { TradeItemResDto, TradeListResDto, UploadTradeImageResDto } from './trade.response';
import { TradeAppService } from './trade.service';
import { TradeInteractTypeEnum } from '../trade.enum';

@ApiTags('app/trade')
@Controller('/api/app/trade')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class TradeAppController {
  constructor(private readonly service: TradeAppService) {}

  @ApiOperation({
    summary: 'Đăng bán tổ yến',
    description: 'Tạo đơn đăng bán tổ yến, bắt buộc phải có ảnh đã upload trước đó cùng uniqueId',
  })
  @Post('sell')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: CreateTradeDto })
  @ApiOkResponse({ type: ApiAppResponseDto(NumberOkResponseDto) })
  async sell(@Body() dto: CreateTradeDto, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.service.sell(dto, user.userCode);
    return {
      message: Msg.CreateOk,
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Upload ảnh tổ yến khi đăng bán',
    description: 'Chỉ upload 1 ảnh duy nhất, lưu vào thư mục /uploads/images/tradeNests',
  })
  @Post('uploadImage')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadTradeImageDto })
  @ApiOkResponse({ type: ApiAppResponseDto([UploadTradeImageResDto]) })
  @UseFilters(MulterBadRequestFilter)
  @UseInterceptors(FileInterceptor('tradeNestFile', multerImgConfig))
  async uploadImage(@Body() dto: UploadTradeImageDto, @UploadedFile() file: Express.Multer.File, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.service.uploadImage(dto, file, user.userCode);
    return {
      message: Msg.UploadOk,
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Xóa ảnh tổ yến đã upload',
    description: 'Xóa file ảnh vật lý trên ổ đĩa và bản ghi trong tbl_trade_file',
  })
  @Delete('deleteImage/:seq')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'seq', type: Number, description: 'ID ảnh trong tbl_trade_file' })
  @ApiOkResponse({ type: ApiAppResponseDto(NumberOkResponseDto) })
  async deleteImage(@Param('seq', ParseIntPipe) seq: number, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.service.deleteImage(seq, user.userCode);
    return {
      message: result > 0 ? Msg.DeleteOk : Msg.DeleteErr,
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Lấy danh sách các bài đăng bán tổ yến',
    description: 'Hỗ trợ phân trang và lọc theo type: ALL (tất cả), SAVED (đã lưu), SEEN (đã xem)',
  })
  @Get('list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(TradeListResDto) })
  async getList(@Query() query: GetTradeListDto, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.service.getList(query, user.userCode);
    return {
      message: Msg.GetOk,
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Lấy chi tiết bài đăng bán tổ yến',
    description: 'Mặc định tự động ghi nhận tương tác đã xem (SEEN) khi gọi API này',
  })
  @Get('detail/:seq')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'seq', type: Number, description: 'ID bài đăng bán trong tbl_trade' })
  @ApiOkResponse({ type: ApiAppResponseDto(TradeItemResDto) })
  async getDetail(@Param('seq', ParseIntPipe) seq: number, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.service.getDetail(seq, user.userCode);
    return {
      message: Msg.GetOk,
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Tương tác lưu bài đăng bán (Lưu / Bỏ lưu)',
    description: 'Toggle lưu hoặc bỏ lưu bài đăng bán (type = SAVED). Bấm lưu lần nữa sẽ bỏ lưu.',
  })
  @Put('interact/:seq')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'seq', type: Number, description: 'ID bài đăng bán trong tbl_trade' })
  @ApiBody({ type: TradeInteractDto, required: false })
  @ApiOkResponse({ type: ApiAppResponseDto(NumberOkResponseDto) })
  async interact(@Param('seq', ParseIntPipe) seq: number, @Body() dto: TradeInteractDto, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.service.interact(seq, user.userCode, dto?.type || TradeInteractTypeEnum.SAVED);
    return {
      message: Msg.UpdateOk,
      data: result,
    };
  }
}
