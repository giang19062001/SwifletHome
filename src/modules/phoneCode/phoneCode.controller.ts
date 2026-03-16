import { Controller, Get, HttpCode, HttpStatus, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { GetPhoneCodeResDto, PhoneCodeResDto } from './phoneCode.response';
import { PhoneCodeService } from './phoneCode.service';

@ApiTags('app/phoneCode')
@Controller('/api/app/phoneCode')
@UseInterceptors(ResponseAppInterceptor)
export default class PhoneCodeController {
  constructor(private readonly phoneCodeService: PhoneCodeService) {}


  @ApiOperation({
    summary: 'Không cần đăng nhập',
  })
  @Get('getAll')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto([GetPhoneCodeResDto]) })
  async getAll(): Promise<PhoneCodeResDto[]> {
    const result = await this.phoneCodeService.getAll();
    return result;
  }
}
