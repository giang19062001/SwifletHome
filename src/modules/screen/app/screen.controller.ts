import { Controller, Get, HttpCode, HttpStatus, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ScreenAppService } from './screen.service';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { GetContentScreenResDto } from './screen.response';
import * as authInterface from 'src/modules/auth/app/auth.interface';
import { GetUserApp } from 'src/decorator/auth.decorator';

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
**REQUEST_DOCTOR**: Màn hình khám bệnh nhà yến`,
    name: 'keyword',
    type: String,
  })
  @Get('getContent/:keyword')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetContentScreenResDto) })
  async getContent(@GetUserApp() user: authInterface.ITokenUserApp, @Param('keyword') keyword: string) {
    const result = await this.screenAppService.getContent(user.userCode, keyword);
    return result;
  }
}
