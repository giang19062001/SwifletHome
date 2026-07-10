import { Controller, Get, HttpCode, HttpStatus, Param, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { GetContentScreenResDto } from './screen.response';
import { ScreenAppService } from './screen.service';

@ApiTags('app/screen')
@Controller('/api/app/screen')
// @ApiBearerAuth('app-auth')
// @UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class ScreenAppController {
  constructor(private readonly screenAppService: ScreenAppService) {}

  @ApiOperation({
    summary: 'Nội dung màn hình đăng kí dịch vụ, màn hình tăng đàn nhà yến.. (không cần đăng nhập)',
  })
  @ApiParam({
    description: `
**SIGNUP_SERVICE**: Màn hình đăng kí dịch vụ,\n
**REQUEST_DOCTOR**: Màn hình tăng đàn nhà yến\n
**REQUEST_QR_GUIDE**: Popup hướng dẫn cho màn hình yêu cầu mã QR \n
**CONSIGNMENT_GUIDE**: Popup hướng dẫn cho màn hình ký gửi\n
**USER_TYPE_NOT_REGISTER**: Màn hình thông báo loại người dùng này chưa được đăng ký`,
    name: 'keyword',
    type: String,
  })
  @Get('getContent/:keyword')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetContentScreenResDto) })
  async getContent(@Param('keyword') keyword: string) {
    const result = await this.screenAppService.getContent(keyword);
    return result;
  }
}
