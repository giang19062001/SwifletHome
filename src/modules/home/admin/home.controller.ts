import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Req,
  Get,
  HttpCode,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UploadedFiles,
  BadRequestException,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';
import { ApiAuthGuard } from 'src/modules/auth/admin/auth.api.guard';
import { HomeAdminService } from './home.service';
import { IHome } from '../home.interface';
import { CreateHomeDto } from './home.dto';
import {
  AnyFilesInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { multerConfig } from 'src/modules/upload/upload.config';

@ApiBearerAuth('swf-token')
@ApiTags('admin/home')
@UseGuards(ApiAuthGuard)
@Controller('/api/admin/home')
export class HomeController {
  constructor(private readonly homeAdminService: HomeAdminService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: PagingDto): Promise<IList<IHome>> {
    const result = await this.homeAdminService.getAll(dto);
    return result;
  }

  @ApiParam({ name: 'homeCode', type: String })
  @Get('getDetail/:homeCode')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('homeCode') homeCode: string): Promise<IHome | null> {
    const result = await this.homeAdminService.getDetail(homeCode);
    return result;
  }

  @Post('createHome')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateHomeDto })
  @UseInterceptors(AnyFilesInterceptor(multerConfig))
  async createHome(
    @Body() createHomeDto: CreateHomeDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const [homeImage, homeImages] = this.homeAdminService.parseHomeImg(files);
    const body = {
      ...createHomeDto,
      homeImage,
      homeImages,
    };

    const result = await this.homeAdminService.createHome(body);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
  @Delete('deleteHome/:homeCode')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'homeCode', type: String })
  async deleteHome(@Param('homeCode') homeCode: string): Promise<number> {
    const result = await this.homeAdminService.deleteHome(homeCode);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
}
