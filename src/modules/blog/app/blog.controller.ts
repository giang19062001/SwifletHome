import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, BadRequestException, Delete, Param, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { IBlog } from '../blog.interface';
import { BlogAppService } from './blog.service';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ResBlogDto } from './blog.dto';

@ApiBearerAuth('app-auth')
@ApiTags('app/blog')
@UseGuards(ApiAuthAppGuard)
@Controller('/api/app/blog')
@UseInterceptors(ResponseAppInterceptor)
export class BlogAppController {
  constructor(private readonly blogAppService: BlogAppService) {}

  @Get('getContent')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ResBlogDto) })
  async getDetail(): Promise<IBlog | null> {
    const result = await this.blogAppService.getContent();
    return result;
  }
}
