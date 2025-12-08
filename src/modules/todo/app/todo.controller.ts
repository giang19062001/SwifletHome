import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, Delete, Param, BadRequestException, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { GetScheduledTasksResDto, GetListTaskAlarmsResDto, GetTaskResDto } from './todo.response';
import { ITodoHomeTaskAlram, ITodoTask } from '../todo.interface';
import { TodoAppService } from './todo.service';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import * as authInterface from 'src/modules/auth/app/auth.interface';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { ListResponseDto, NullResponseDto, ZeroResponseDto } from 'src/dto/common.dto';
import { Msg } from 'src/helpers/message.helper';
import { ChangeTaskAlarmStatusDto, GetListTaskAlarmsDTO, SetTaskPeriodDto } from './todo.dto';
import TodoAppValidate from './todo.validate';
import { IListApp } from 'src/interfaces/app.interface';

@ApiTags('app/todo')
@Controller('/api/app/todo')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export default class TodoAppController {
  constructor(private readonly todoAppService: TodoAppService) {}

  @Get('getTasks')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto([GetTaskResDto]) })
  async getTasks(): Promise<ITodoTask[]> {
    const result = await this.todoAppService.getTasks();
    return result;
  }

  @ApiOperation({
    summary: 'Thông tin todo của nhà yến được chọn là chính của user đăng nhập hiện tại',
  })
  @ApiParam({ name: 'userHomeCode', type: String })
  @Get('getScheduledTasks/:userHomeCode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetScheduledTasksResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getScheduledTasks(@Param('userHomeCode') userHomeCode: string, @GetUserApp() user: authInterface.ITokenUserApp) {
    const result = await this.todoAppService.getScheduledTasks(user.userCode, userHomeCode);
    return result;
  }

  @ApiBody({
    type: GetListTaskAlarmsDTO,
  })
  @Post('getListTaskAlarms')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ApiAppResponseDto(ListResponseDto(GetListTaskAlarmsResDto)),
    description: `**taskStatus**: enum('WAITING','COMPLETE','CANCEL')\n`
  })
  async getAll(@GetUserApp() user: authInterface.ITokenUserApp, @Body() dto: GetListTaskAlarmsDTO): Promise<IListApp<ITodoHomeTaskAlram>> {
    const result = await this.todoAppService.getListTaskAlarms(user.userCode, dto.userHomeCode, dto);
    return result;
  }

  @ApiOperation({
    summary: 'Thay đổi trạng thái của lịch nhắc ( hoàn thành / hủy )',
  })
  @Put('changeTaskAlarmStatus/:taskAlarmCode')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'taskAlarmCode', type: String })
  @ApiBody({
    type: ChangeTaskAlarmStatusDto,
    description: `**taskStatus**: enum('COMPLETE','CANCEL')`,
  })
  @ApiOkResponse({ type: ApiAppResponseDto(Number) })
  async changeTaskAlarmStatus(@Param('taskAlarmCode') taskAlarmCode: string, @Body() dto: ChangeTaskAlarmStatusDto, @GetUserApp() user: authInterface.ITokenUserApp): Promise<number> {
    const result = await this.todoAppService.changeTaskAlarmStatus(dto.taskStatus, user.userCode, taskAlarmCode);

    // ko nên cập nhập lại thành "chờ"
    if (dto.taskStatus == 'WAITING') {
      throw new BadRequestException({
        message: Msg.UpdateErr,
        data: 0,
      });
    }
    if (result === 0) {
      throw new BadRequestException({
        message: Msg.UpdateErr,
        data: 0,
      });
    }

    return result;
  }

  @ApiOperation({
    summary: 'Thiết lập lịch nhắc cho 1 nhà yến nào đó',
  })
  @Post('setTaskAlarm')
  @ApiBody({
    type: SetTaskPeriodDto,
    description: `**taskCode** là giá trị lấy từ api/app/todo/getTasks, được phép **null** nếu **isCustomTask** của lịch nhắc là **Y**, không được phép **null** nếu **isCustomTask** của lịch nhắc là **N** \n
**taskCustomName** giá trị được phép rỗng nếu **isCustomTask** của lịch nhắc là **N**, giá trị không được phép rỗng nếu **isCustomTask** của lịch nhắc là **Y**\n
**taskType** enum('WEEK','MONTH','SPECIFIC') với **WEEK** là lịch nhắc lặp lại theo tuần, **MONTH** là lịch nhắc lặp lại theo tháng,  **SPECIFIC** là lịch nhắc cho 1 ngày cụ thể trong tương lai\n
**periodValue** number | null, được phép **null** nếu **taskType** là **SPECIFIC**, không được phép **null** nếu **taskType** là **WEEK** hoặc **MONTH**, nếu **taskType** là **WEEK** thì giá trị sẽ là (1 -> 7) (Thứ 2 -> Chủ nhật) *ISO Day of Week*,
nếu **taskType** là **MONTH** thì giá trị sẽ là (1 -> 31)\n
**specificValue** date | null, được phép **null** nếu **taskType** là **WEEK** hoặc **MONTH**, không được phép **null** nếu **taskType** là **SPECIFIC**, giá trị sẽ có định dạng **YYYY-MM-DD** 
       `,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(Number) })
  @ApiBadRequestResponse({ type: ZeroResponseDto })
  async setTaskAlarm(@GetUserApp() user: authInterface.ITokenUserApp, @Body() dto: SetTaskPeriodDto) {
    const err: string = TodoAppValidate.SetTaskPeriodValidate(dto);
    if (err) {
      throw new BadRequestException({
        message: err,
        data: 0,
      });
    }
    const result = await this.todoAppService.setTaskAlarmPeriod(user.userCode, dto);

    if (result == -1) {
      throw new BadRequestException({
        message: Msg.DuplicateTaskAlram,
        data: 0,
      });
    }
    if (result == 0) {
      throw new BadRequestException({
        message: Msg.RegisterErr,
        data: 0,
      });
    }
    return {
      message: Msg.RegisterOk,
      data: result,
    };
  }
}
