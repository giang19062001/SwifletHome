import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, BadRequestException, Delete, Param, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { IBlog } from '../blog.interface';
import { BlogAppService } from './blog.service';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { GetUserApp } from 'src/decorator/auth.decorator';
import * as userInterface from 'src/modules/user/app/user.interface';
import { SearchService } from 'src/common/search/search.service';
import { GetContentBlogResDto } from './blog.response';
import * as authInterface from 'src/modules/auth/app/auth.interface';

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

  @ApiOperation({
    summary: 'Dẫn dụ chim đêm tab,..',
  })
  @Get('getContent')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetContentBlogResDto) })
  async getContent(@GetUserApp() user: authInterface.ITokenUserApp): Promise<string | null> {
    const blog = await this.blogAppService.getContent();
    if (blog) {
      const res = this.searchService.replyBaseOnUserPackage(blog?.blogContent, blog?.isFree, user.userCode);
      return res;
    } else {
      return null;
    }
  }
}
