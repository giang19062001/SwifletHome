import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { NumberErrResponseDto, NumberOkResponseDto } from 'src/dto/common.dto';
import { Msg } from 'src/helpers/message.helper';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { TokenUserAppResDto } from "src/modules/auth/app/auth.dto";
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { TodoAlarmAppService } from './todo-alarm.service';
import { SetTaskAlarmDto } from './todo.dto';
import TodoAppValidate from './todo.validate';

@ApiTags('app/todo')
@Controller('/api/app/v2/todo')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export default class TodoAppControllerV2 {
  constructor(private readonly todoAlarmAppService: TodoAlarmAppService) {}

  @ApiOperation({
    summary: 'Thiết lập lịch nhắc cho 1 nhà yến nào đó',
  })
  @Post('setTaskAlarm')
  @ApiBody({
    type: SetTaskAlarmDto,
    description: `
**specificValue** date, giá trị không được phép **null**, giá trị sẽ có định dạng **YYYY-MM-DD**\n
**taskCustomName**: String giá trị không được phép rỗng\n 
       `,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  @ApiBadRequestResponse({ type: NumberErrResponseDto })
  async setTaskAlarm(@GetUserApp() user: TokenUserAppResDto, @Body() dto: SetTaskAlarmDto) {
    const err: string = TodoAppValidate.setTaskAlarmValidate(dto);
    if (err) {
      throw new BadRequestException({
        message: err,
        data: 0,
      });
    }
    const result = await this.todoAlarmAppService.setTaskAlarm(user.userCode, dto);

    if (result == -2) {
      throw new BadRequestException({
        message: Msg.DuplicateTaskPeriod,
        data: 0,
      });
    }
    if (result == -1) {
      throw new BadRequestException({
        message: Msg.DuplicateTaskAlram,
        data: 0,
      });
    }
    if (result == 0) {
      throw new BadRequestException({
        message: Msg.SetTaskErr,
        data: 0,
      });
    }
    return {
      message: Msg.SetTaskOk,
      data: result,
    };
  }
  
}
