import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Req,
  Get,
  HttpCode,
  UseGuards,
  Put,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { AnswerAppService } from './answer.service';
import { SearchService } from 'src/common/search/search.service';
import { ResponseAppInterceptor } from 'src/interceptors/response';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';

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

  @ApiParam({
    name: 'question',
    type: String,
    example: 'Âm thanh dẫn dụ chim yến ?',
  })
  @Get('reply/:question')
  @HttpCode(HttpStatus.OK)
  async reply(@Param('question') question: string): Promise<any> {
    const faqData = await this.answerAppService.reply();
    const result = this.searchService.findAnswer(question, faqData);
    return result
  }
}
