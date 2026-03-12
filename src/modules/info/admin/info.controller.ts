import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Param, BadRequestException, Put, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { InfoAdminService } from './info.service';
import { UpdateInfoDto } from './info.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { ListResponseDto } from "src/dto/common.dto";
import { InfoResDto } from "../info.response";
import { TokenUserAdminResDto } from "src/modules/auth/admin/auth.dto";

@ApiBearerAuth('admin-auth')
@ApiTags('admin/info')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/info')
export class InfoAdminController {
  constructor(private readonly infoAdminService: InfoAdminService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: PagingDto): Promise<{ total: number; list: InfoResDto[] }> {
    const result = await this.infoAdminService.getAll(dto);
    return result;
  }

  @ApiParam({ name: 'infoKeyword', type: String })
  @Get('getDetail/:infoKeyword')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('infoKeyword') infoKeyword: string): Promise<InfoResDto | null> {
    const result = await this.infoAdminService.getDetail(infoKeyword);
    if (!result) {
      throw new BadRequestException();
    }
    return result;
  }

  @ApiBody({ type: UpdateInfoDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  @Put('update/:keyword')
  async update(
    @Body() dto: UpdateInfoDto,
    @Param('keyword') infoKeyword: string,
    @GetUserAdmin() admin: TokenUserAdminResDto,
    @UploadedFiles() files: Express.Multer.File[], // tất cả file trong formData
  ): Promise<number> {
    const filedFile = this.infoAdminService.getFieldFileByKeyword(infoKeyword);

    // parse data
    if (typeof dto.infoContent === 'string') {
      dto.infoContent = JSON.parse(dto.infoContent);
    }
    if (files.length > 0) {
      const newFilepath = await this.infoAdminService.replaceFiledFile(filedFile, files[0]);
      // cập nhập lại dto cho update ( qrcode )
      dto.infoContent[filedFile] = newFilepath;
    }

    // update
    const result = await this.infoAdminService.update(dto, admin.userId, infoKeyword);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
}
