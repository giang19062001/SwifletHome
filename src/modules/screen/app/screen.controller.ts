import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ScreenAppService } from './screen.service';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { GetContentScreenResDto } from './screen.response';

@ApiTags('app/screen')
@Controller('/api/app/screen')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class ScreenAppController {
  constructor(private readonly screenAppService: ScreenAppService) {}

  @ApiOperation({
    summary: 'Màn hình đăng kí dịch vụ,..',
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
  async getContent(@Param('keyword') keyword: string) {
    const result = await this.screenAppService.getContent(keyword);
    return result;
  }
}
