import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, Delete, Param, BadRequestException, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { TodoAppService } from './todo.service';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import * as authInterface from 'src/modules/auth/app/auth.interface';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { EmptyArrayResponseDto, ListResponseDto, NullResponseDto, NumberErrResponseDto, NumberOkResponseDto } from 'src/dto/common.dto';
import { Msg } from 'src/helpers/message.helper';
import { SetTaskPeriodV2Dto } from './todo.dto';
import TodoAppValidate from './todo.validate';
import { IListApp } from 'src/interfaces/app.interface';

@ApiTags('app/todo')
@Controller('/api/app/v2/todo')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export default class TodoAppControllerV2 {
  constructor(private readonly todoAppService: TodoAppService) {}

  @ApiOperation({
    summary: 'Thiết lập lịch nhắc cho 1 nhà yến nào đó',
  })
  @Post('setTaskAlarm')
  @ApiBody({
    type: SetTaskPeriodV2Dto,
    description: `
**specificValue** date, giá trị không được phép **null**, giá trị sẽ có định dạng **YYYY-MM-DD**\n
**taskCustomName**: String giá trị không được phép rỗng\n 
       `,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  @ApiBadRequestResponse({ type: NumberErrResponseDto })
  async setTaskAlarm(@GetUserApp() user: authInterface.ITokenUserApp, @Body() dto: SetTaskPeriodV2Dto) {
    const err: string = TodoAppValidate.SetTaskPeriodValidateV2(dto);
    if (err) {
      throw new BadRequestException({
        message: err,
        data: 0,
      });
    }
    const result = await this.todoAppService.setTaskAlarmPeriodV2(user.userCode, dto);

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
