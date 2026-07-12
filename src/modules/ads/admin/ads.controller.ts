import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { multerImgConfig } from 'src/config/multer.config';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { PagingDto } from 'src/dto/admin.dto';
import { Msg } from 'src/helpers/message.helper';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { TokenUserAdminResDto } from '../../auth/admin/auth.response';
import { AdsFileDto, CreateAdsBannerDto, UpdateAdsBannerDto } from './ads.dto';
import { AdsBannerAdminResDto } from './ads.response';
import { AdsAdminService } from './ads.service';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/ads')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/ads')
export class AdsAdminController {
  constructor(private readonly adsAdminService: AdsAdminService) {}

  @Post('uploadAdsBanner')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: AdsFileDto })
  @UseInterceptors(FileInterceptor('adsBanner', multerImgConfig))
  async uploadAdsBanner(@UploadedFile() file: Express.Multer.File, @Body() dto: AdsFileDto, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<{ url: string }> {
    if (!file) throw new BadRequestException(Msg.FileEmpty);
    if (!dto.uuid) throw new BadRequestException('Vui lòng cung cấp uuid');
    const result = await this.adsAdminService.uploadAdsFile(dto.uuid, file, admin.userId);
    return { url: result.url };
  }

  @ApiBody({ type: PagingDto })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: PagingDto): Promise<{ total: number; list: AdsBannerAdminResDto[] }> {
    return await this.adsAdminService.getAll(dto);
  }

  @ApiParam({ name: 'seq', type: Number })
  @Get('getDetail/:seq')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('seq') seq: number): Promise<AdsBannerAdminResDto | null> {
    const result = await this.adsAdminService.getDetail(seq);
    if (!result) throw new BadRequestException();
    return result;
  }

  @ApiBody({ type: CreateAdsBannerDto })
  @Post('create')
  @HttpCode(HttpStatus.OK)
  async create(@Body() dto: CreateAdsBannerDto, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    if (new Date(dto.endTime).getTime() <= new Date(dto.startTime).getTime()) {
      throw new BadRequestException('Ngày kết thúc phải lớn hơn ngày bắt đầu');
    }
    const result = await this.adsAdminService.create(dto, admin.userId);
    if (result === 0) throw new BadRequestException();
    return result;
  }

  @ApiBody({ type: UpdateAdsBannerDto })
  @ApiParam({ name: 'seq', type: Number })
  @Put('update/:seq')
  @HttpCode(HttpStatus.OK)
  async update(@Body() dto: UpdateAdsBannerDto, @Param('seq') seq: number, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    if (new Date(dto.endTime).getTime() <= new Date(dto.startTime).getTime()) {
      throw new BadRequestException('Ngày kết thúc phải lớn hơn ngày bắt đầu');
    }
    const result = await this.adsAdminService.update(dto, admin.userId, seq);
    if (result === 0) throw new BadRequestException();
    return result;
  }

  @Delete('delete/:seq')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'seq', type: Number })
  async delete(@Param('seq') seq: number): Promise<number> {
    const result = await this.adsAdminService.delete(seq);
    if (result === 0) throw new BadRequestException();
    return result;
  }
}
