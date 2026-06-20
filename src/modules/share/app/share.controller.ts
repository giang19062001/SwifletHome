import { Body, Controller, HttpCode, HttpStatus, Post, Get, Param, UseInterceptors, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ShareAppService } from './share.service';
import { GetShareLinkDto } from './share.dto';
import { GetShareLinkResDto, GetShareDataResDto } from './share.response';
import { NullResponseDto } from 'src/dto/common.dto';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';

@ApiTags('app/share')
@Controller('/api/app/share')
@UseInterceptors(ResponseAppInterceptor)
export default class ShareAppController {
  constructor(private readonly shareService: ShareAppService) {}

  @ApiBearerAuth('app-auth')
  @UseGuards(ApiAuthAppGuard)
  @ApiOperation({
    summary: 'Tạo hoặc lấy link chia sẻ đã tạo trước đó',
    description: `**Yêu cầu đăng nhập**`,
  })
  @Post('getLink')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetShareLinkResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getShareLink(@Body() dto: GetShareLinkDto) {
    const link = await this.shareService.getShareLink(dto);
    return { link };
  }

  @ApiOperation({
    summary: 'Lấy dữ liệu chia sẻ qua token (Không yêu cầu đăng nhập)',
    description: `
    **shareType**: enum(HARVEST) hãy dựa vào trường này để quyết định màn hình hiển thị
      `,
  })
  @Get('getData/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetShareDataResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getShareData(@Param('token') token: string) {
    const result = await this.shareService.getShareData(token);
    return result;
  }
}
