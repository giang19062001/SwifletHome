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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PagingDto } from 'src/dto/common';
import { IListApp } from 'src/interfaces/common';
import { IHome } from '../home.interface';
import { HomeAppService } from './home.service';
import { ResponseInterceptor } from 'src/interceptors/response';

@ApiTags('app/home')
@Controller('/api/app/home')
@UseInterceptors(ResponseInterceptor)
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
}
