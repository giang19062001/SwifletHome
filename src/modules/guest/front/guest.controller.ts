import { Body, Controller, HttpCode, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { CreateGuestConsulationDto } from './guest.dto';
import { GuestService } from './guest.service';
import { NumberErrResponseDto, NumberOkResponseDto } from 'src/dto/common.dto';
import { Msg } from 'src/helpers/message.helper';

@ApiTags('front/guest')
@Controller('/api/front/guest')
@UseInterceptors(ResponseAppInterceptor)
export class GuestController {
  constructor(private readonly guestService: GuestService) { }

  @ApiOperation({
    summary: 'Yêu cầu tư vấn',
    description: 'API này không cần xác thực để cho phép khách hàng vãng lai gửi thông tin liên hệ.',
  })
  @ApiBody({ type: CreateGuestConsulationDto })
  @ApiOkResponse({ type: NumberOkResponseDto })
  @ApiBadRequestResponse({ type: NumberErrResponseDto })
  @Post('requestConsulation')
  @Throttle({ sensitive: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async requestConsulation(@Body() dto: CreateGuestConsulationDto) {
    const result = await this.guestService.requestConsulation(dto);
    return {
      message: Msg.RegisterOk,
      data: result,
    };
  }
}
