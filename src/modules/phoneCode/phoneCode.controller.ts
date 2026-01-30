import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, Delete, Param, BadRequestException, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { GetPhoneCodeResDto } from './phoneCode.response';
import { IPhoneCode } from './phoneCode.interface';
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
  async getAll(): Promise<IPhoneCode[]> {
    const result = await this.phoneCodeService.getAll();
    return result;
  }
}
