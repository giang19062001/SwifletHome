import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBadRequestResponse, ApiHeader, ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { NumberErrResponseDto, NumberOkResponseDto } from 'src/dto/common.dto';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { CheckoutPayDto } from './checkout.dto';
import { ApiKeyGuard } from './checkout.guard';
import { CheckoutAppService } from './checkout.service';

@ApiTags('app/checkout')
@Controller('api/app/checkout')
@UseInterceptors(ResponseAppInterceptor)
export class CheckoutAppController {
  constructor(private readonly checkoutAppService: CheckoutAppService) {}

  @Post('pay')
  @ApiOperation({ summary: 'Webhook từ RevenueCat hoặc mobile app để nhận thanh toán' })
  @ApiSecurity('revenuecat-auth')
  @ApiOkResponse({ type: NumberOkResponseDto })
  @ApiBadRequestResponse({ type: NumberErrResponseDto })
  @UseGuards(ApiKeyGuard)
  @Throttle({ sensitive: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async checkoutPay(@Body() dto: CheckoutPayDto) {
    return await this.checkoutAppService.checkoutPay(dto);
  }
}
