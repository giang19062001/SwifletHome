import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards, UseInterceptors, UploadedFiles, BadRequestException, UseFilters, UploadedFile } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { getDoctorMulterConfig, multerImgConfig } from 'src/config/multer.config';
import { MulterBadRequestFilter } from 'src/filter/uploadError.filter';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { GetUserApp } from 'src/decorator/auth.decorator';
import * as userInterface from 'src/modules/user/app/user.interface';
import { Msg } from 'src/helpers/message.helper';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { UserHomeAppService } from './userHome.service';
import { CreateUserHomeDto, ResUserHomeDto, ResUserHomeImageDto, UploadUserHomeImageDto } from './userHome.dto';
import { PagingDto } from 'src/dto/admin.dto';
import { IUserHome } from './userHome.interface';
import { ResListDto } from 'src/dto/common.dto';
import { IList } from 'src/interfaces/admin.interface';

@ApiTags('app/user')
@Controller('/api/app/user')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class UserHomeAppController {
  constructor(private readonly userHomeAppService: UserHomeAppService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getHomes')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ResListDto(ResUserHomeDto)) })
  async getSwtHouses(@Body() dto: PagingDto, @GetUserApp() user: userInterface.IUserApp,): Promise<IList<IUserHome>> {
    const result = await this.userHomeAppService.getAll(dto, user.userCode);
    return result;
  }

  @Post('createHome')
  @ApiBody({ type: CreateUserHomeDto, description: '**\`uuid\`** dùng khi post dữ liệu phải trùng với **\`uuid\`** khi upload file' })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(Number) })
  async createSwtHouse(@GetUserApp() user: userInterface.IUserApp, @Body() dto: CreateUserHomeDto) {
    const result = await this.userHomeAppService.create(user.userCode, dto);
    if (result === -1) {
      throw new BadRequestException({
        message: Msg.uuidNotFound,
        data: 0,
      });
    }
    if (result === 0) {
      throw new BadRequestException();
    }
    return {
      message: Msg.CreateOk,
      data: result,
    };
  }

  @Post('uploadHomeImageForCreating')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadUserHomeImageDto })
  @UseFilters(MulterBadRequestFilter)
  @UseInterceptors(FileInterceptor('userHomeImage', multerImgConfig))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ResUserHomeImageDto) })
  async uploadImageForCreating(@GetUserApp() user: userInterface.IUserApp, @Body() dto: UploadUserHomeImageDto, @UploadedFile() userHomeImage: Express.Multer.File) {
    return await this.userHomeAppService.uploadImageForCreating(user.userCode, dto, userHomeImage);
  }
}
