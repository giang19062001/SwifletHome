import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { InfoAppService } from './info.service';
import { GetInfoResDto } from './info.response';

@ApiTags('app/info')
@Controller('/api/app/info')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class InfoAppController {
  constructor(private readonly infoAppService: InfoAppService) {}

  @ApiOperation({
    summary: 'Thông tin ngân hàng, chủ hệ thống..',
  })
  @ApiParam({
    description: `
**BANK**: Thông tin ngân hàng chủ hệ thống,\n
**OWNER**: Thông tin liên lạc chủ hệ thống`,
    name: 'keyword',
    type: String,
  })
  @Get('getContent/:keyword')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetInfoResDto) })
  async getContent(@Param('keyword') keyword: string) {
    const result = await this.infoAppService.getDetail(keyword);
    return result;
  }
}
