import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { GetAdsBannerDto } from './ads.dto';
import { AdsBannerResDto } from './ads.response';
import { AdsAppService } from './ads.service';

@ApiTags('app/ads')
@Controller('api/app/ads')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class AdsAppController {
  constructor(private readonly adsAppService: AdsAppService) {}

  @Post('getBanner')
  @ApiOperation({ summary: 'Lấy danh sách banner quảng cáo theo màn hình', description: `
  **REMINDER_SCREEN**: màn hình 'lịch nhắc việc'\n
  **NOTIFICATION_SCREEN**: màn hình 'thông báo'\n
  **ACCOUNT_SCREEN**: màn hình 'thông tin tài khoản'\n
  `})
  @ApiOkResponse({ type: [AdsBannerResDto] })
  @HttpCode(HttpStatus.OK)
  async getBanners(@Body() dto: GetAdsBannerDto) {
    return await this.adsAppService.getBanners(dto);
  }
}
