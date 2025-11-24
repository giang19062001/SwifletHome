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
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { HomeSaleAdminService } from './homeSale.service';
import { IHomeSale, IHomeSaleSubmit } from '../homeSale.interface';
import { CreateHomeDto, UpdateHomeDto, UpdateStatusDto } from './homeSale.dto';
import { AnyFilesInterceptor, FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerImgConfig } from 'src/config/multer.config';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/homeSale')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/homeSale')
export class HomeSaleAdminController {
  constructor(private readonly homeSaleAdminService: HomeSaleAdminService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: PagingDto): Promise<IList<IHomeSale>> {
    const result = await this.homeSaleAdminService.getAll(dto);
    return result;
  }

  @ApiParam({ name: 'homeCode', type: String })
  @Get('getDetail/:homeCode')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('homeCode') homeCode: string): Promise<IHomeSale | null> {
    const result = await this.homeSaleAdminService.getDetail(homeCode);
    if (!result) {
      throw new BadRequestException();
    }
    return result;
  }

  @Post('create')
  @HttpCode(HttpStatus.OK)
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

    const result = await this.homeSaleAdminService.create(body);
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

    const result = await this.homeSaleAdminService.update(dto, homeCode);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @Delete('delete/:homeCode')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'homeCode', type: String })
  async delete(@Param('homeCode') homeCode: string): Promise<number> {
    const result = await this.homeSaleAdminService.delete(homeCode);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  // TODO: SUBMIT 
  @ApiBody({
    type: PagingDto,
  })
  @Post('getAllSubmit')
  @HttpCode(HttpStatus.OK)
  async getAllSubmit(@Body() dto: PagingDto): Promise<IList<IHomeSaleSubmit>> {
    const result = await this.homeSaleAdminService.getAllSubmit(dto);
    return result;
  }

  @ApiBody({ type: UpdateStatusDto })
  @ApiParam({ name: 'seq', type: Number })
  @Put('updateSubmit/:seq')
  @HttpCode(HttpStatus.OK)
  async updateSubmit(@Body() dto: UpdateStatusDto, @Param('seq') seq: number): Promise<number> {
    const result = await this.homeSaleAdminService.updateSubmit(dto, seq);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @ApiParam({ name: 'seq', type: Number })
  @Get('getDetailSubmit/:seq')
  @HttpCode(HttpStatus.OK)
  async getDetailSubmit(@Param('seq') seq: number): Promise<IHomeSaleSubmit | null> {
    const result = await this.homeSaleAdminService.getDetailSubmit(seq);
    if (!result) {
      throw new BadRequestException();
    }
    return result;
  }
}
