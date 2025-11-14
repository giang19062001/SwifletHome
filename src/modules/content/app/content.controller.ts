import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response';
import { ContentAppService } from './content.service';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';

@ApiTags('app/content')
@Controller('/api/app/content')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class ContentAppController {
  constructor(private readonly contentAppService: ContentAppService) {}

  @ApiParam({
    description: '**character:** `SIGNUP_SERVICE`',
    name: 'character',
    type: String,
  })
  @Get('getDetail/:character')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('character') character: string) {
    const result = await this.contentAppService.getDetail(character);
    if (!result) {
      throw new BadRequestException();
    }
    return result;
  }
}
