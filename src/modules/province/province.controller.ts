import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, Delete, Param, BadRequestException, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ProvinceService } from './province.service';
import { IProvince } from './province.interface';
import { ResProvinceDto } from './province.dto';

@ApiTags('app/province')
@Controller('/api/app/province')
@UseInterceptors(ResponseAppInterceptor)
export default class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}


  @ApiOperation({
    summary: 'Không cần xác thực',
  })
  @Get('getAll')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto([ResProvinceDto]) })
  async getAll(): Promise<IProvince[]> {
    const result = await this.provinceService.getAll();
    return result;
  }
}
