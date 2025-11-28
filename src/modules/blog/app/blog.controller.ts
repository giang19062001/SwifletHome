import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, BadRequestException, Delete, Param, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { IBlog } from '../blog.interface';
import { BlogAppService } from './blog.service';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ResBlogDto } from './blog.dto';
import { GetUserApp } from 'src/decorator/auth.decorator';
import * as userInterface from 'src/modules/user/app/user.interface';
import { SearchService } from 'src/common/search/search.service';

@ApiBearerAuth('app-auth')
@ApiTags('app/blog')
@UseGuards(ApiAuthAppGuard)
@Controller('/api/app/blog')
@UseInterceptors(ResponseAppInterceptor)
export class BlogAppController {
  constructor(
    private readonly blogAppService: BlogAppService,
    private readonly searchService: SearchService,
  ) {}

  @Get('getContent')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ResBlogDto) })
  async getDetail(@GetUserApp() user: userInterface.IUserApp): Promise<string | null> {
    const blog = await this.blogAppService.getContent();
    if (blog) {
      const res = this.searchService.replyBaseOnUserPackage(blog?.blogContent, blog?.isFree, user.packageRemainDays);
      return res;
    } else {
      return null;
    }
  }
}
