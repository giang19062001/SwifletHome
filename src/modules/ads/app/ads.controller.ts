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
  @ApiOperation({
    summary: 'Lấy danh sách banner quảng cáo theo màn hình',
    description: `
  - **targetScreen**:\n
      **REMINDER_SCREEN**: màn hình 'lịch nhắc việc'\n
      **NOTIFICATION_SCREEN**: màn hình 'thông báo'\n
      **ACCOUNT_SCREEN**: màn hình 'thông tin tài khoản'\n
      **QR_SCREEN**: màn hình 'Danh sách mã QR code'\n
      **CONSIGNMENT_SCREEN**: màn hình 'Gửi yến đi nước ngoài'\n
      **REQUEST_DOCTOR**: màn hình 'Tăng đàn nhà yến'\n
  
  - **position**:\n
      **TOP**: Đầu màn hình\n
      **MIDDLE**: Giữa màn hình\n
      **BOTTOM**: Đáy màn hình\n
    
  - **bannerType**:\n
      **LARGE**: Loại ảnh lớn\n
      **SMALL**: Loại ảnh nhỏ\n
    
  - **actionType**:\n
      **LINK**: Chuyển hướng\n
      **FUNCTION**: Chức năng\n
  `,
  })
  @ApiOkResponse({ type: [AdsBannerResDto] })
  @HttpCode(HttpStatus.OK)
  async getBanners(@Body() dto: GetAdsBannerDto) {
    return await this.adsAppService.getBanners(dto);
  }
}
