import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, Param, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { AnswerAppService } from './answer.service';
import { SearchService } from 'src/common/search/search.service';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { AnswerReplyDto } from './answer.dto';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { GetUserApp } from 'src/decorator/auth.decorator';
import * as userInterface from 'src/modules/user/app/user.interface';

@ApiTags('app/answer')
@Controller('/api/app/answer')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class AnswerAppController {
  constructor(
    private readonly answerAppService: AnswerAppService,
    private readonly searchService: SearchService,
  ) {}

  @Post('reply')
  @ApiBody({ type: AnswerReplyDto })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(String) })
  async reply(@Body() dto: AnswerReplyDto, @GetUserApp() user: userInterface.IUserApp): Promise<string> {
    const result = await this.answerAppService.reply();
    const res = this.searchService.reply(dto.question, user.packageRemainDays, result);
    return res;
  }
}
