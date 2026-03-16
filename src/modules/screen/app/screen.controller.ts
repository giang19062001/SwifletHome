import { Controller, Get, HttpCode, HttpStatus, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { TokenUserAppResDto } from "src/modules/auth/app/auth.dto";
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { GetContentScreenResDto } from './screen.response';
import { ScreenAppService } from './screen.service';

@ApiTags('app/screen')
@Controller('/api/app/screen')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class ScreenAppController {
  constructor(private readonly screenAppService: ScreenAppService) {}

  @ApiOperation({
    summary: 'Nội dung màn hình đăng kí dịch vụ, màn hình khám bệnh nhà yến..',
  })
  @ApiParam({
    description: `
**SIGNUP_SERVICE**: Màn hình đăng kí dịch vụ,\n
**REQUEST_DOCTOR**: Màn hình khám bệnh nhà yến\n
**REQUEST_QR_GUIDE**: Popup hướng dẫn cho màn hình yêu cầu mã QR \n
**CONSIGNMENT_GUIDE**: Popup hướng dẫn cho màn hình ký gửi`,
    name: 'keyword',
    type: String,
  })
  @Get('getContent/:keyword')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetContentScreenResDto) })
  async getContent(@GetUserApp() user: TokenUserAppResDto, @Param('keyword') keyword: string) {
    const result = await this.screenAppService.getContent(user.userCode, keyword);
    return result;
  }
}
