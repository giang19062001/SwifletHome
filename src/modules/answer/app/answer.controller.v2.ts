import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { Msg } from 'src/helpers/message.helper';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { TokenUserAppResDto } from "src/modules/auth/app/auth.dto";
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { AnswerReplyDtoV2 } from './answer.dto';
import { AnswerAppService } from './answer.service';

@ApiTags('app/answer')
@Controller('/api/app/v2/answer')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class AnswerAppV2Controller {
  constructor(
    private readonly answerAppService: AnswerAppService,
  ) {}

  @Post('reply')
  @ApiBody({ type: AnswerReplyDtoV2 })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(Object) })
  async reply(@Body() dto: AnswerReplyDtoV2, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.answerAppService.replyV2(dto.question, user.userCode, dto.currentChatHistories);
    return {
      message: Msg.GetOk,
      data: result,
    };
  }
}
