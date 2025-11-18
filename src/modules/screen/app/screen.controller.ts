import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response';
import { ScreenAppService } from './screen.service';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';

@ApiTags('app/screen')
@Controller('/api/app/screen')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class ScreenAppController {
  constructor(private readonly screenAppService: ScreenAppService) {}

  @ApiParam({
    description: '**keyword:** `SIGNUP_SERVICE`',
    name: 'keyword',
    type: String,
  })
  @Get('getContent/:keyword')
  @HttpCode(HttpStatus.OK)
  async getContent(@Param('keyword') keyword: string) {
    const result = await this.screenAppService.getContent(keyword);
    if (!result) {
      throw new BadRequestException();
    }
    return result;
  }
}
