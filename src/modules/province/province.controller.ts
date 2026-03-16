import { Controller, Get, HttpCode, HttpStatus, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { GetProvinceResDto, ProvinceResDto } from './province.response';
import { ProvinceService } from './province.service';

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
  async getAll(): Promise<ProvinceResDto[]> {
    const result = await this.provinceService.getAll();
    return result;
  }
}
