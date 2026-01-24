import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, Delete, Param, BadRequestException, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { NullResponseDto } from 'src/dto/common.dto';
import { QrAppService } from './qr.service';
import { GetInfoToRequestQrcodeResDto } from './qr.dto';
import { GetUserApp } from 'src/decorator/auth.decorator';
import * as authInterface from 'src/modules/auth/app/auth.interface';

@ApiTags('app/qr')
@Controller('/api/app/qr')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export default class QrAppController {
  constructor(private readonly qrAppService: QrAppService) {}

  @ApiOperation({
    summary: 'Lấy thông tin để yêu cầu tạo mã Qrcode',
    description: ``,
  })
  @Get('getInfoToRequestQrcode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetInfoToRequestQrcodeResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getInfoToRequestQrcode(@Param('userHomeCode') userHomeCode: string, @GetUserApp() user: authInterface.ITokenUserApp) {
    const result = await this.qrAppService.getInfoToRequestQrcode(userHomeCode,user)
    return result
  }
}
