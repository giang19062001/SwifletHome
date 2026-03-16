import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileFieldsInterceptor, } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { multerImgConfig } from 'src/config/multer.config';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { TokenUserAdminResDto } from "src/modules/auth/admin/auth.dto";
import { HomeSaleResDto, HomeSaleSightSeeingResDto } from "../homeSale.response";
import { CreateHomeDto, UpdateHomeDto, UpdateStatusDto } from './homeSale.dto';
import { HomeSaleAdminService } from './homeSale.service';

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
  async getAll(@Body() dto: PagingDto): Promise<{ total: number; list: HomeSaleResDto[] }> {
    const result = await this.homeSaleAdminService.getAll(dto);
    return result;
  }

  @ApiParam({ name: 'homeCode', type: String })
  @Get('getDetail/:homeCode')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('homeCode') homeCode: string): Promise<HomeSaleResDto | null> {
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
    @GetUserAdmin() admin: TokenUserAdminResDto,
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

    const result = await this.homeSaleAdminService.create(body, admin.userId);
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
    @Body() updateHomeDto: UpdateHomeDto,
    @Param('homeCode') homeCode: string,
    @GetUserAdmin() admin: TokenUserAdminResDto,
    @UploadedFiles()
    files: {
      homeImage?: Express.Multer.File[];
      homeImages?: Express.Multer.File[];
    },
  ) {
    const homeImage = files.homeImage?.[0] || null;
    const homeImages = files.homeImages || [];
    const dto = {
      ...updateHomeDto,
      homeImage,
      homeImages,
    };

    const result = await this.homeSaleAdminService.update(dto, admin.userId, homeCode);
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

  // TODO: SIGHTSEEING
  @ApiBody({
    type: PagingDto,
  })
  @Post('getAllSightseeing')
  @HttpCode(HttpStatus.OK)
  async getAllSightseeing(@Body() dto: PagingDto): Promise<{ total: number; list: HomeSaleSightSeeingResDto[] }> {
    const result = await this.homeSaleAdminService.getAllSightseeing(dto);
    return result;
  }

  @ApiBody({ type: UpdateStatusDto })
  @ApiParam({ name: 'seq', type: Number })
  @Put('updateSightseeing/:seq')
  @HttpCode(HttpStatus.OK)
  async updateSightseeing(@Body() dto: UpdateStatusDto, @Param('seq') seq: number, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    const result = await this.homeSaleAdminService.updateSightseeing(dto, admin.userId, seq);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @ApiParam({ name: 'seq', type: Number })
  @Get('getDetailSightseeing/:seq')
  @HttpCode(HttpStatus.OK)
  async getDetailSightseeing(@Param('seq') seq: number): Promise<HomeSaleSightSeeingResDto | null> {
    const result = await this.homeSaleAdminService.getDetailSightseeing(seq);
    if (!result) {
      throw new BadRequestException();
    }
    return result;
  }
}
