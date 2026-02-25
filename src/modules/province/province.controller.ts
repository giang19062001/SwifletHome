import { Controller, HttpStatus, Get, HttpCode, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ProvinceService } from './province.service';
import { IProvince } from './province.interface';
import { GetProvinceResDto } from './province.response';

@ApiTags('app/province')
@Controller('/api/app/province')
@UseInterceptors(ResponseAppInterceptor)
export default class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}


  @ApiOperation({
    summary: 'Không cần đăng nhập',
  })
  @Get('getAll')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto([GetProvinceResDto]) })
  async getAll(): Promise<IProvince[]> {
    const result = await this.provinceService.getAll();
    return result;
  }
}
