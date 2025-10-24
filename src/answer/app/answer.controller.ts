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
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { AnswerAppService } from './answer.service';
import { SearchService } from 'src/search/search.service';

@ApiTags('app/answer')
@Controller('/api/app/answer')
export class AnswerAppController {
  constructor(
    private readonly answerService: AnswerAppService,
    private readonly searchService: SearchService,
  ) {}

  @ApiParam({
    name: 'question',
    type: String,
    example: 'Mái chống nóng là gì?',
  })
  @Post('reply/:question')
  @HttpCode(HttpStatus.OK)
  async reply(@Param('question') question: string): Promise<string> {
    const faqData = await this.answerService.reply();
    const result = this.searchService.findAnswer(question, faqData);
    return result;
  }
}
