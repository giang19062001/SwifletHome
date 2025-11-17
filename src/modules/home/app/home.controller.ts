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
import { PagingDto } from 'src/dto/admin';
import { IHome } from '../home.interface';
import { HomeAppService } from './home.service';
import { ResponseAppInterceptor } from 'src/interceptors/response';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { IListApp } from 'src/interfaces/app';

@ApiTags('app/home')
@Controller('/api/app/home')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class HomeAppController {
  constructor(private readonly homeAppService: HomeAppService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: PagingDto): Promise<IListApp<IHome>> {
    const result = await this.homeAppService.getAll(dto);
    return result;
  }

  @ApiParam({ name: 'homeCode', type: String })
  @Get('getDetail/:homeCode')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('homeCode') homeCode: string): Promise<IHome | null> {
    const result = await this.homeAppService.getDetail(homeCode);
      if (!result) {
      throw new BadRequestException();
    }
    return result;
  }
}
