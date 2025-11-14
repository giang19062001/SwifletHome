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
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { HomeAdminService } from './home.service';
import { IHome } from '../home.interface';
import { CreateHomeDto, UpdateHomeDto } from './home.dto';
import { AnyFilesInterceptor, FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerImgConfig } from 'src/config/multer';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/home')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/home')
export class HomeAdminController {
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
    if (!result) {
      throw new BadRequestException();
    }
    return result;
  }

  @Post('create')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateHomeDto })
  // @UseInterceptors(AnyFilesInterceptor(multerImgConfig))
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'homeImage', maxCount: 1 },
        { name: 'homeImages', maxCount: 10 },
      ],
      multerImgConfig,
    ),
  )
  async create(
    @Body() createHomeDto: CreateHomeDto,
    // @UploadedFiles() files: Express.Multer.File[],
    @UploadedFiles()
    files: {
      homeImage?: Express.Multer.File[];
      homeImages?: Express.Multer.File[];
    },
  ) {
    const homeImage = files.homeImage?.[0] || null;
    const homeImages = files.homeImages || [];
    const body = {
      ...createHomeDto,
      homeImage,
      homeImages,
    };

    const result = await this.homeAdminService.create(body);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @Put('update/:homeCode')
  @ApiParam({ name: 'homeCode', type: String })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateHomeDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'homeImage', maxCount: 1 },
        { name: 'homeImages', maxCount: 10 },
      ],
      multerImgConfig,
    ),
  )
  async update(
    @Body() createHomeDto: UpdateHomeDto,
    @Param('homeCode') homeCode: string,
    @UploadedFiles()
    files: {
      homeImage?: Express.Multer.File[];
      homeImages?: Express.Multer.File[];
    },
  ) {
    const homeImage = files.homeImage?.[0] || null;
    const homeImages = files.homeImages || [];
    const dto = {
      ...createHomeDto,
      homeImage,
      homeImages,
    };

    const result = await this.homeAdminService.update(dto, homeCode);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @Delete('delete/:homeCode')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'homeCode', type: String })
  async delete(@Param('homeCode') homeCode: string): Promise<number> {
    const result = await this.homeAdminService.delete(homeCode);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
}
