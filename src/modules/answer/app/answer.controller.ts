import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, Param, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { AnswerAppService } from './answer.service';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { AnswerReplyDto } from './answer.dto';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { GetUserApp } from 'src/decorator/auth.decorator';
import * as authInterface from 'src/modules/auth/app/auth.interface';
import { Msg } from 'src/helpers/message.helper';

@ApiTags('app/answer')
@Controller('/api/app/answer')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class AnswerAppController {
  constructor(
    private readonly answerAppService: AnswerAppService,
  ) {}

  @Post('reply')
  @ApiBody({ type: AnswerReplyDto })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(String) })
  async reply(@Body() dto: AnswerReplyDto, @GetUserApp() user: authInterface.ITokenUserApp) {
    const result = await this.answerAppService.reply(dto.question, user.userCode);
    return {
      message: Msg.GetOk,
      data: result,
    };
  }
}
