import { Body, Controller, HttpCode, HttpStatus, Post, Get, Param, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ShareAppService } from './share.service';
import { GetShareLinkDto } from './share.dto';
import { GetShareLinkResDto } from './share.response';
import { NullResponseDto } from 'src/dto/common.dto';
import { GetInfoTaskHarvestForAdjustResDto } from 'src/modules/todo/app/todo.response';

@ApiTags('app/share')
@Controller('/api/app/share')
@UseInterceptors(ResponseAppInterceptor)
export default class ShareAppController {
  constructor(private readonly shareService: ShareAppService) {}

  @ApiOperation({
    summary: 'Tạo hoặc lấy link chia sẻ đã tạo trước đó',
    description: ``,
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
    summary: 'Lấy dữ liệu chia sẻ qua token',
    description: ``,
  })
  @Get('getData/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetInfoTaskHarvestForAdjustResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getShareData(@Param('token') token: string) {
    const result = await this.shareService.getShareData(token);
    return result;
  }
}
