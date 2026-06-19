import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UploadedFiles, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { getImgVideoMulterConfig } from 'src/config/multer.config';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ListResponseDto, NullResponseDto, NumberErrResponseDto, NumberOkResponseDto } from 'src/dto/common.dto';
import { MulterBadRequestFilter } from 'src/filter/uploadError.filter';
import { Msg } from 'src/helpers/message.helper';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { TokenUserAppResDto } from 'src/modules/auth/app/auth.dto';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { CreateSaleHomeAppDto, UploadFilesAppDto } from './saleHome.dto';
import { GetAllSaleHomeResDto, GetDetailSaleHomeResDto, GetInitFormMutationResDto, UploadSaleHomeFileResDto } from './saleHome.response';
import { SaleHomeAppService } from './saleHome.service';
import { VideoConverterInterceptor } from 'src/interceptors/video-converter.interceptor';
import { PagingDto } from 'src/dto/admin.dto';

@ApiTags('app/saleHome')
@Controller('/api/app/saleHome')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class SaleHomeAppController {
  constructor(private readonly saleHomeAppService: SaleHomeAppService) {}

  @ApiOperation({
    summary: 'Lấy dữ liệu khởi tạo form tạo nhà yến sale',
  })
  @Get('getInitFormMutation')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetInitFormMutationResDto) })
  async getInitFormMutation(): Promise<GetInitFormMutationResDto> {
    const result = await this.saleHomeAppService.getInitFormMutation();
    return result;
  }

  @ApiOperation({ summary: 'Upload ảnh/video cho nhà yến sale', description: 'Gắn liền với uniqueId, fileTypeCode để phân biệt loại ảnh/video' })
  @Post('uploadFiles')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFilesAppDto })
  @ApiOkResponse({ type: ApiAppResponseDto([UploadSaleHomeFileResDto]) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  @UseInterceptors(FilesInterceptor('saleHomeFiles', 5, getImgVideoMulterConfig(5)), VideoConverterInterceptor)
  async uploadFiles(@Body() dto: UploadFilesAppDto, @GetUserApp() user: TokenUserAppResDto, @UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new BadRequestException({ message: Msg.FileEmpty, data: null });
    const result = await this.saleHomeAppService.uploadFiles(dto, files, user.userCode);
    return {
      message: Msg.UploadOk,
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Tạo mới nhà yến sale',
  })
  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: CreateSaleHomeAppDto })
  @ApiOkResponse({ type: ApiAppResponseDto(NumberOkResponseDto) })
  @ApiBadRequestResponse({ type: NumberErrResponseDto })
  async createSaleHome(@Body() dto: CreateSaleHomeAppDto, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.saleHomeAppService.createSaleHome(dto, user.userCode);
    if (result === -1) {
      throw new BadRequestException({
        message: Msg.HomeAlreadyRegistered,
        data: 0,
      });
    }
    if (result === 0) {
      throw new BadRequestException({
        message: Msg.RegisterErr,
        data: 0,
      });
    }
    return {
      message: Msg.RegisterOk,
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Xóa file ảnh/video đã upload',
    description: `Truyền seq của file muốn xóa trên url`,
  })
  @Delete('deleteFile/:seq')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(NumberOkResponseDto) })
  @ApiBadRequestResponse({ type: NumberErrResponseDto })
  async deleteFile(@Param('seq') seq: number, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.saleHomeAppService.deleteFile(seq, user.userCode);
    return {
      message: result > 0 ? Msg.DeleteOk : Msg.DeleteErr,
      data: result,
    };
  }

  @ApiOperation({ summary: 'Lấy danh sách nhà yến' })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: PagingDto })
  @ApiOkResponse({ type: ApiAppResponseDto(ListResponseDto(GetAllSaleHomeResDto)) })
  async getAllSaleHomes(@Body() dto: PagingDto, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.saleHomeAppService.getAllSaleHomes(dto, user.userCode);
    return {
      message: Msg.GetOk,
      data: result,
    };
  }

  @ApiOperation({ summary: 'Lấy chi tiết nhà yến' })
  @Get('getDetail/:homeCode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetDetailSaleHomeResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getDetailSaleHome(@Param('homeCode') homeCode: string) {
    const result = await this.saleHomeAppService.getDetailSaleHome(homeCode);
    if (!result) {
      throw new BadRequestException({ message: Msg.HomeNotFound, data: null });
    }
    return {
      message: Msg.GetOk,
      data: result,
    };
  }
}
