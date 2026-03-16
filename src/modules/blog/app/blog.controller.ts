import { Controller, Get, HttpCode, HttpStatus, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { TokenUserAppResDto } from "src/modules/auth/app/auth.dto";
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { GetContentBlogResDto } from './blog.response';
import { BlogAppService } from './blog.service';

@ApiBearerAuth('app-auth')
@ApiTags('app/blog')
@UseGuards(ApiAuthAppGuard)
@Controller('/api/app/blog')
@UseInterceptors(ResponseAppInterceptor)
export class BlogAppController {
  constructor(
    private readonly blogAppService: BlogAppService,
  ) {}

  @ApiOperation({
    summary: 'Dẫn dụ chim đêm tab,..',
  })
  @Get('getContent')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetContentBlogResDto) })
  async getContent(@GetUserApp() user: TokenUserAppResDto): Promise<string> {
    const result = await this.blogAppService.getContent(user.userCode);
    return result
  }
}
