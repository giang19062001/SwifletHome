import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, Delete, Param, BadRequestException, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { GetScheduledTasksResDto, GetListTaskAlarmsResDto, GetTaskResDto, GetCompleteTaskHarvestResDto } from './todo.response';
import { ITodoHomeTaskAlram, ITodoTask } from '../todo.interface';
import { TodoAppService } from './todo.service';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import * as authInterface from 'src/modules/auth/app/auth.interface';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { EmptyArrayResponseDto, ListResponseDto, NullResponseDto, NumberErrResponseDto, NumberOkResponseDto } from 'src/dto/common.dto';
import { Msg } from 'src/helpers/message.helper';
import { ChangeTaskAlarmStatusDto, CompleteHarvestTaskDto, CompleteMedicineTaskDto, GetListTaskAlarmsDTO, SetTaskPeriodDto } from './todo.dto';
import TodoAppValidate from './todo.validate';
import { IListApp } from 'src/interfaces/app.interface';

@ApiTags('app/todo')
@Controller('/api/app/todo')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export default class TodoAppController {
  constructor(private readonly todoAppService: TodoAppService) {}

  @ApiOperation({
    summary: 'Lấy danh sách các lịch nhắc có sẵn của hệ thống: Thu hoạch, lăn thuốc, dẫn dụ chim đêm,...',
  })
  @Get('getTasks')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto([GetTaskResDto]) })
  async getTasks(): Promise<ITodoTask[]> {
    const result = await this.todoAppService.getTasks();
    return result;
  }

  @ApiOperation({
    summary: 'Thông tin todo của 1 nhà yến (thu hoạch, lăn thuốc,...)',
  })
  @ApiParam({ name: 'userHomeCode', type: String })
  @Get('getScheduledTasks/:userHomeCode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto([GetScheduledTasksResDto]) })
  @ApiBadRequestResponse({ type: EmptyArrayResponseDto })
  async getScheduledTasks(@Param('userHomeCode') userHomeCode: string, @GetUserApp() user: authInterface.ITokenUserApp) {
    const result = await this.todoAppService.getScheduledTasks(user.userCode, userHomeCode);
    if (!result.length) {
      throw new BadRequestException({
        data: [],
      });
    }
    return result;
  }

  @ApiOperation({
    summary: 'Danh sách lịch nhắc việc của 1 nhà yến ( chỉ hiển thị lịch nhắc quá khứ, lịch nhắc trong ngầy hiện tại nếu có, và 5 ngày sắp tới )',
  })
  @ApiBody({
    type: GetListTaskAlarmsDTO,
  })
  @Post('getListTaskAlarms')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ApiAppResponseDto(ListResponseDto(GetListTaskAlarmsResDto)),
    description: `
**taskStatus**: enum('WAITING','COMPLETE','CANCEL')\n
**taskStatusLabel**: enum('Đang chờ','Hoàn thành','Bị hủy')  --- Hiển thị text trạng thái trên APP \n
**taskPeriodCode**: string | null\n
**taskPeriodCode**: string | null\n
**leftEvent**:  enum('CANCEL')
<ul>
  <li> Nếu là 'CANCEL' thì gọi <u>/api/todo/app/changeTaskAlarmStatus</u> API như hiện tại</li>
</ul>\n
**leftEventLabel**: enum('Hủy')  --- Hiển thị text nút bên trái của lịch nhắc trên APP \n
**rightEvent**:  enum('HARVEST','MEDICINE','COMPLETE')
<ul>
  <li>Nếu là 'COMPLETE' thì gọi <u>/api/todo/app/changeTaskAlarmStatus</u> API như hiện tại</li>
  <li>Nếu là 'HARVEST' thì mở Modal nhập dữ liệu thu hoạch tổ yến</li>
  <li>Nếu là 'MEDICINE' thì mở Modal nhập tên thuốc</li>
</ul>\n
**rightEventLabel**: enum('Hoàn thành','Nhập dữ liệu', 'Ghi chú')  --- Hiển thị text nút bên phải của lịch nhắc trên APP \n
`,
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
  @ApiOkResponse({ type: NumberOkResponseDto })
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
    summary: 'Thiết lập lịch nhắc cho 1 nhà yến nào đó  ⚠️ **API này sẽ bị xóa trong version tiếp theo**',
  })
  @Post('setTaskAlarm')
  @ApiBody({
    type: SetTaskPeriodDto,
    description: `**isPeriod** enum('Y','N')\n
**periodType** enum('WEEK','MONTH'), nếu **isPeriod** của lịch nhắc là **Y** thì giá trị không được phép **null** và phải mang giá trị **WEEK** hoặc **MONTH**, nếu **isPeriod** là **N** thì giá trị được phép **null**\n
**periodValue** number | null, được phép **null** nếu **isPeriod** là **N** và **periodType** là **null** , không được phép **null** nếu **isPeriod** là **Y** và **periodType** là **WEEK** hoặc **MONTH**, nếu **periodType** là **WEEK** thì giá trị sẽ là (1 -> 7) (Thứ 2 -> Chủ nhật),
nếu **periodType** là **MONTH** thì giá trị sẽ là (1 -> 31)\n
**specificValue** date | null, được phép **null** nếu **isPeriod** là **Y**, không được phép **null** nếu **isPeriod** là **N**, giá trị sẽ có định dạng **YYYY-MM-DD**\n
**taskCode** là giá trị lấy từ api/app/todo/getTasks, giá trị được phép **null** nếu **isCustomTask** của lịch nhắc là **Y**, không được phép **null** nếu **isCustomTask** của lịch nhắc là **N** \n
**isCustomTask** enum('Y','N')\n
**taskCustomName** giá trị được phép rỗng ("") nếu **isCustomTask** của lịch nhắc là **N**, giá trị không được phép rỗng ("") nếu **isCustomTask** của lịch nhắc là **Y**\n 
       `,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  @ApiBadRequestResponse({ type: NumberErrResponseDto })
  async setTaskAlarm(@GetUserApp() user: authInterface.ITokenUserApp, @Body() dto: SetTaskPeriodDto) {
    const err: string = TodoAppValidate.SetTaskPeriodValidate(dto);
    if (err) {
      throw new BadRequestException({
        message: err,
        data: 0,
      });
    }
    const result = await this.todoAppService.setTaskAlarmPeriod(user.userCode, dto);

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

  // TODO: COMPLETE-MEDICINE
  @ApiOperation({
    summary: 'Đánh dấu hoàn thành task ghi chú lăn thuốc',
  })
  @Post('setCompleteTaskMedicine')
  @ApiBody({
    type: CompleteMedicineTaskDto,
    description: `
**taskAlarmCode**: Mã code của lịch nhắc\n
**medicineNote**: Tên thuốc `,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  @ApiBadRequestResponse({ type: NumberErrResponseDto })
  async setCompleteTaskMedicine(@GetUserApp() user: authInterface.ITokenUserApp, @Body() dto: CompleteMedicineTaskDto) {
    const result = await this.todoAppService.setCompleteTaskMedicine(user.userCode, dto);
    if (result == -1) {
      throw new BadRequestException({
        message: Msg.OnlyMedicineTaskCanDo,
        data: 0,
      });
    }
    if (result == -2) {
      throw new BadRequestException({
        message: Msg.AlreadyCompleteCannotDo,
        data: 0,
      });
    }
    if (result == -3) {
      throw new BadRequestException({
        message: Msg.MedicineTaskAlreadyAdded,
        data: 0,
      });
    }
    if (result == 0) {
      throw new BadRequestException({
        message: Msg.UpdateErr,
        data: 0,
      });
    }
    return {
      message: Msg.UpdateOk,
      data: result,
    };
  }

  // TODO: COMPLETE-HARVER
  @ApiOperation({
    summary: 'Đánh dấu hoàn thành task nhập dữ liệu thu hoạch',
  })
  @Post('setCompleteTaskHarvest')
  @ApiBody({
    type: CompleteHarvestTaskDto,
    description: `
<ul>
  <li><b>taskAlarmCode</b>: Mã code của lịch nhắc</li>
  </li>
  <li><b>harvestData</b>: Danh sách dữ liệu thu hoạch
    <ul>
      <li><b>floor</b>: Số tầng</li>
      <li><b>floorData</b>: Danh sách ô trong tầng
        <ul>
          <li><b>cell</b>: Số ô</li>
          <li><b>cellCollected</b>: Giá trị dữ liệu thu hoạch của ô - đã thu </li>
          <li><b>cellRemain</b>: Giá trị dữ liệu thu hoạch của ô - còn lại</li>
        </ul>
      </li>
    </ul>
  </li>
  <li><b>isComplete</b>: ENUM('Y','N') - đánh dấu hoàn thành tất cả
</ul>
`,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  @ApiBadRequestResponse({ type: NumberErrResponseDto })
  async setCompleteTaskHarvest(@GetUserApp() user: authInterface.ITokenUserApp, @Body() dto: CompleteHarvestTaskDto) {
    const result = await this.todoAppService.setCompleteTaskHarvest(user.userCode, dto);
    if (result == -1) {
      throw new BadRequestException({
        message: Msg.OnlyHarvestTaskCanDo,
        data: 0,
      });
    }
    if (result == -2) {
      throw new BadRequestException({
        message: Msg.AlreadyCompleteCannotDo,
        data: 0,
      });
    }

    if (result == 0) {
      throw new BadRequestException({
        message: Msg.UpdateErr,
        data: 0,
      });
    }
    return {
      message: Msg.UpdateOk,
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Lấy thông tin dữ liệu thu hoạch của 1 lịch nhắc',
    description: `Luôn gọi API này khi bấm nút 'Nhập dữ liệu' để nhận dữ liệu khởi tạo ban đầu Hoặc dữ liệu đã có trong database để gắn vào Form nhập dữ liệu ( dựa theo số tầng của nhà yến thuộc lịch nhắc đó)`,
  })
  @ApiParam({ name: 'taskAlarmCode', type: String })
  @Get('getCompleteTaskHarvest/:taskAlarmCode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetCompleteTaskHarvestResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getCompleteTaskHarvest(@Param('taskAlarmCode') taskAlarmCode: string, @GetUserApp() user: authInterface.ITokenUserApp) {
    const result = await this.todoAppService.getCompleteTaskHarvest(user.userCode, taskAlarmCode);
    if (result == -1) {
      throw new BadRequestException({
        message: Msg.OnlyHarvestTaskCanDo,
        data: 0,
      });
    }
    if (result == -2) {
      throw new BadRequestException({
        message: Msg.HomeOfAlarmNotExist,
        data: 0,
      });
    }
    if (result == -3) {
      throw new BadRequestException({
        message: Msg.FloorOfHomeIsZero,
        data: 0,
      });
    }
    return result;
  }
}
