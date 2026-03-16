import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { Msg } from 'src/helpers/message.helper';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { TokenUserAppResDto } from "src/modules/auth/app/auth.dto";
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { AnswerReplyDto } from './answer.dto';
import { AnswerAppService } from './answer.service';

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
  async reply(@Body() dto: AnswerReplyDto, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.answerAppService.reply(dto.question, user.userCode);
    return {
      message: Msg.GetOk,
      data: result,
    };
  }
}
