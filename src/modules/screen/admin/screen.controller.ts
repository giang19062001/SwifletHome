import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Param, Post, Put, Get, Delete, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { TokenUserAdminResDto } from 'src/modules/auth/admin/auth.dto';
import { getFileLocation, multerImgConfig } from 'src/config/multer.config';
import { Msg } from 'src/helpers/message.helper';
import { UploadImgFileDto } from 'src/modules/upload/admin/upload.dto';
import { UploadAdminService } from 'src/modules/upload/admin/upload.service';
import { UpdateScreenDto } from './screen.dto';
import { ScreenAdminService } from './screen.service';
import { ScreenAdminResDto, ScreenVideoAdminResDto } from './screen.response';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/screen')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/screen')
export class ScreenAdminController {
  constructor(
    private readonly screenAdminService: ScreenAdminService,
    private readonly uploadAdminService: UploadAdminService,
  ) {}

  @Post('uploadScreenImage/:screenKeyword')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImgFileDto })
  @UseInterceptors(FileInterceptor('screenImage', multerImgConfig))
  async uploadScreenImage(
    @Param('screenKeyword') screenKeyword: string,
    @Body() dto: UploadImgFileDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUserAdmin() admin: TokenUserAdminResDto,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException(Msg.FileEmpty);
    }

    const url = `${getFileLocation(file.mimetype, file.filename)}/${file.filename}`;
    await this.screenAdminService.updateBanner(screenKeyword, url, admin.userId);
    return { url };
  }

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: PagingDto): Promise<{ total: number; list: ScreenAdminResDto[] }> {
    const result = await this.screenAdminService.getAll(dto);
    return result;
  }

  @ApiBody({ type: UpdateScreenDto })
  @ApiParam({ name: 'keyword', type: String })
  @Put('update/:keyword')
  @HttpCode(HttpStatus.OK)
  async update(@Body() dto: UpdateScreenDto, @Param('keyword') screenKeyword: string, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    const result = await this.screenAdminService.update(dto, admin.userId, screenKeyword);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  // xử lí video cho screen dùng kiểu BANNER_VIDEOS_TEXT
  @Get(':screenKeyword/video/getAll')
  @HttpCode(HttpStatus.OK)
  async getAllVideos(@Param('screenKeyword') screenKeyword: string): Promise<ScreenVideoAdminResDto[]> {
    return this.screenAdminService.getAllVideos(screenKeyword);
  }

  @Post(':screenKeyword/video/create')
  @HttpCode(HttpStatus.OK)
  async createVideo(@Param('screenKeyword') screenKeyword: string, @Body() dto: any, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    return this.screenAdminService.createVideo(screenKeyword, dto, admin.userId);
  }

  @Put(':screenKeyword/video/update/:seq')
  @HttpCode(HttpStatus.OK)
  async updateVideo(@Param('screenKeyword') screenKeyword: string, @Param('seq') seq: number, @Body() dto: any, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    return this.screenAdminService.updateVideo(screenKeyword, seq, dto, admin.userId);
  }

  @Delete(':screenKeyword/video/delete/:seq')
  @HttpCode(HttpStatus.OK)
  async deleteVideo(@Param('screenKeyword') screenKeyword: string, @Param('seq') seq: number, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    return this.screenAdminService.deleteVideo(screenKeyword, seq, admin.userId);
  }

  @Put(':screenKeyword/video/updateSort')
  @HttpCode(HttpStatus.OK)
  async updateVideoSortOrder(@Param('screenKeyword') screenKeyword: string, @Body() dto: any, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    return this.screenAdminService.updateVideoSortOrder(screenKeyword, dto.items, admin.userId);
  }
}
