import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { EmptyArrayResponseDto, ListResponseDto, NullResponseDto, NumberErrResponseDto, NumberOkResponseDto } from 'src/dto/common.dto';
import { QUERY_HELPER } from 'src/helpers/const.helper';
import { Msg } from 'src/helpers/message.helper';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { TokenUserAppResDto } from 'src/modules/auth/app/auth.dto';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { TodoTaskAlramResDto, TodoTaskResDto } from '../todo.response';
import { TodoAlarmAppService } from './todo-alarm.service';
import { TodoHarvestAppService } from './todo-harvest.service';
import { TodoMedicineAppService } from './todo-medicine.service';
import {
  AdjustHarvestTaskDto,
  ChangeTaskAlarmStatusDto,
  GetInfoTaskHarvestForAdjustDto,
  GetListTaskAlarmsDTO,
  GetListTaskHarvestForAdjustDto,
  SetHarvestTaskDto,
  SetTaskMedicineDto,
} from './todo.dto';
import {
  GetInfoTaskHarvestForAdjustResDto,
  GetListTaskAlarmsResDto,
  GetListTaskHarvestResDto,
  GetScheduledTasksResDto,
  GetTaskHarvestResDto,
  GetTaskResDto,
  GetTasksMedicineResDto,
} from './todo.response';

@ApiTags('app/todo')
@Controller('/api/app/todo')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export default class TodoAppController {
  constructor(
    private readonly todoAlarmAppService: TodoAlarmAppService,
    private readonly todoHarvestAppService: TodoHarvestAppService,
    private readonly todoMedicineAppService: TodoMedicineAppService,
  ) {}

  @ApiOperation({
    summary: 'Lấy danh sách các lịch nhắc có sẵn của hệ thống: Thu hoạch, lăn thuốc, vệ sinh,.. ⚠️ TẠM THỜI KO DÙNG NỮA',
  })
  @Get('getTasks')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto([GetTaskResDto]) })
  async getTasks(): Promise<TodoTaskResDto[]> {
    const result = await this.todoAlarmAppService.getTasks();
    return result;
  }

  @ApiOperation({
    summary: `Danh sách lịch nhắc việc của 1 nhà yến ( chỉ hiển thị lịch nhắc quá khứ, lịch nhắc trong ngày hiện tại nếu có, và ${QUERY_HELPER.MAX_DAY_GET_LIST_ALARM} ngày sắp tới )`,
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
**leftEvent**:  enum('CANCEL')
<ul>
  <li> Nếu là 'CANCEL' thì gọi <u>/api/todo/app/changeTaskAlarmStatus</u> API như hiện tại</li>
</ul>\n
**leftEventLabel**: enum('Hủy')  --- Hiển thị text nút bên trái của lịch nhắc trên APP \n
**rightEvent**:  enum('COMPLETE')
<ul>
  <li>Nếu là 'COMPLETE' thì gọi <u>/api/todo/app/changeTaskAlarmStatus</u> API như hiện tại</li>
</ul>\n
**rightEventLabel**: enum('Hoàn thành')  --- Hiển thị text nút bên phải của lịch nhắc trên APP \n
`,
  })
  async getAll(@GetUserApp() user: TokenUserAppResDto, @Body() dto: GetListTaskAlarmsDTO): Promise<{ total: number; list: TodoTaskAlramResDto[] }> {
    const result = await this.todoAlarmAppService.getListTaskAlarms(user.userCode, dto.userHomeCode, dto);
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
  async changeTaskAlarmStatus(@Param('taskAlarmCode') taskAlarmCode: string, @Body() dto: ChangeTaskAlarmStatusDto, @GetUserApp() user: TokenUserAppResDto): Promise<number> {
    const result = await this.todoAlarmAppService.changeTaskAlarmStatus(dto.taskStatus, user.userCode, taskAlarmCode);

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
    summary: 'Thông tin 4 BOX (thu hoạch, lăn thuốc, chim đêm, độ ẩm) của nhà yến chính',
  })
  @Get('getScheduledTasks')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto([GetScheduledTasksResDto]) })
  @ApiBadRequestResponse({ type: EmptyArrayResponseDto })
  async getScheduledTasks(@GetUserApp() user: TokenUserAppResDto) {
    const result = await this.todoAlarmAppService.getScheduledTasks(user.userCode);
    if (!result.length) {
      throw new BadRequestException({
        data: [],
      });
    }
    return result;
  }

  // TODO: MEDICINE
  @ApiOperation({
    summary: 'Ghi chú lăn thuốc',
  })
  @Post('setTaskMedicine')
  @ApiBody({
    type: SetTaskMedicineDto,
    description: `
**taskAlarmCode**: (String) Mã code của lịch nhắc hiện tại lấy từ API <i>/api/app/todo/getScheduledTasks/{userHomeCode}</i> để render ra 4 Box (Lăn thuốc, Thu hoạch, Chim đêm, Độ ẩm),
nếu bấm vào Box lăn thuốc sẽ thì truyền **taskAlarmCode** từ màn hình chính vào Props của màn hình chứa Form Ghi chú lăn thuốc để tự động nhập **taskAlarmCode** vào body bên dưới, giá trị có thể là rỗng ""\n
**medicineOptionCode**: (String) Mã code thuốc lấy từ API <i>/api/app/options/getAll</i> với body là { "mainOption": "TODO_TASK", "subOption": "MEDICINE", "keyOption": ""} \n
**medicineNote**: (String) Tên thuốc - được phép rỗng nếu **medicineOptionCode** != 'COD000007' (OTHER), không được phép rỗng nếu **medicineOptionCode** = 'COD000007'\n
**medicineNextDate** (date), giá trị sẽ có định dạng **YYYY-MM-DD** ( mặc định là ngày hiện tại) \n
**medicineUsage** (String), dung lượng thuốc sử dụng  `,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  @ApiBadRequestResponse({ type: NumberErrResponseDto })
  async setTaskMedicine(@GetUserApp() user: TokenUserAppResDto, @Body() dto: SetTaskMedicineDto) {
    const result = await this.todoMedicineAppService.setTaskMedicine(user.userCode, dto);
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
        message: Msg.MedicineInvalidDateExecute,
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
    summary: 'Lấy thông tin dữ liệu lăn thuốc có sẵn cho Form ghi chú lăn thuốc',
    description: `Luôn gọi API này khi vào màn hình 'Form ghi chú lăn thuốc' để nhận dữ liệu khởi tạo ban đầu Hoặc dữ liệu đã sẵn để gắn vào Form ghi chú lăn thuốc`,
  })
  @ApiQuery({
    name: 'taskAlarmCode',
    type: String,
    required: false,
    description: `Mã lịch nhắc (taskAlarmCode) lấy từ API <i>/api/app/todo/getScheduledTasks/{userHomeCode}</i> cái API render ra 4 Box (Lăn thuốc, Thu hoạch, Chim đêm, Độ ẩm),
nếu bấm vào Box lăn thuốc sẽ thì truyền **taskAlarmCode** từ màn hình chính vào Props của màn hình chứa Form Ghi chú lăn thuốc để tự động gọi API này, giá trị  **taskAlarmCode** có thể là rỗng ""\n`,
  })
  @Get('getTaskMedicine')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetTasksMedicineResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getTaskMedicine(@Query('taskAlarmCode') taskAlarmCode?: string) {
    // có thể rỗng -> init data, ko rỗng -> data từ db
    const result = await this.todoMedicineAppService.getTaskMedicine(taskAlarmCode ?? '');
    return result;
  }
  // TODO: HARVERT
  @ApiOperation({
    summary: 'Nhập dữ liệu thu hoạch',
  })
  @Post('setTaskHarvest')
  @ApiBody({
    type: SetHarvestTaskDto,
    description: `
<ul>
  <li><b>taskAlarmCode</b>: Mã code của lịch nhắc</li>
  <li><b>harvestPhase</b>: Int - số đợt trong năm
  <li><b>harvestNextDate</b>: Date - YYYY-MM-DD ( mặc định là ngày hiện tại)
  <li><b>isComplete</b>: ENUM('Y','N') - đánh dấu hoàn thành tất cả
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
</ul>
`,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  @ApiBadRequestResponse({ type: NumberErrResponseDto })
  async setTaskHarvest(@GetUserApp() user: TokenUserAppResDto, @Body() dto: SetHarvestTaskDto) {
    const result = await this.todoHarvestAppService.setTaskHarvest(user.userCode, dto);
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
    summary: 'Lấy thông tin dữ liệu thu hoạch có sẵn cho Form nhập dữ liệu thu hoạch',
    description: `Luôn gọi API này khi vào màn hình 'Form nhập dữ liệu thu hoạch' để nhận dữ liệu khởi tạo ban đầu Hoặc dữ liệu đã sẵn để gắn vào 'Form nhập dữ liệu thu hoạch'`,
  })
  @ApiQuery({
    name: 'taskAlarmCode',
    type: String,
    required: false,
    description: `Mã lịch nhắc (taskAlarmCode) lấy từ API <i>/api/app/todo/getScheduledTasks/{userHomeCode}</i> cái API render ra 4 Box (Lăn thuốc, Thu hoạch, Chim đêm, Độ ẩm),
nếu bấm vào Box thu hoạch sẽ thì truyền **taskAlarmCode** từ màn hình chính vào Props của màn hình chứa Form nhập dữ liệu thu hoạch để tự động gọi API này, giá trị  **taskAlarmCode** có thể là rỗng ""\n`,
  })
  @Get('getTaskHarvest')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetTaskHarvestResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getTaskHarvest(@GetUserApp() user: TokenUserAppResDto, @Query('taskAlarmCode') taskAlarmCode?: string) {
    const result = await this.todoHarvestAppService.getTaskHarvest(user.userCode, taskAlarmCode ?? '');
    if (result == 0) {
      throw new BadRequestException({
        message: Msg.GetErr,
        data: null,
      });
    }
    if (result == -1) {
      throw new BadRequestException({
        message: Msg.OnlyHarvestTaskCanDo,
        data: null,
      });
    }
    if (result == -2) {
      throw new BadRequestException({
        message: Msg.HomeOfAlarmNotExist,
        data: null,
      });
    }
    if (result == -3) {
      throw new BadRequestException({
        message: Msg.FloorOfHomeIsZero,
        data: null,
      });
    }
    if (result == -4) {
      throw new BadRequestException({
        message: Msg.AlreadyCompleteCannotDo,
        data: null,
      });
    }
    return result;
  }

  @ApiOperation({
    summary: 'Lấy danh sách thu hoạch chưa yêu cầu mã QRcode để điều chỉnh',
    description: `
**userHomeCode**: Mã nhà yến`,
  })
  @ApiBody({
    type: GetListTaskHarvestForAdjustDto,
  })
  @Post('getListTaskHarvestForAdjust')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ListResponseDto(GetListTaskHarvestResDto)) })
  async getListTaskHarvestForAdjust(@GetUserApp() user: TokenUserAppResDto, @Body() dto: GetListTaskHarvestForAdjustDto) {
    const result = await this.todoHarvestAppService.getListTaskHarvestForAdjust(dto, user.userCode);
    return result;
  }

  @ApiOperation({
    summary: 'Lấy thông tin dữ liệu thu hoạch trước khi thực hiện điều chỉnh',
    description: `
**seq**: Truyền giá trị từ <i>getListTaskHarvestForAdjust</i> API\n
**userHomeCode**: Truyền giá trị từ <i>getListTaskHarvestForAdjust</i> API\n
**harvestPhase**: Truyền giá trị từ <i>getListTaskHarvestForAdjust</i> API\n
**harvestYear**: Truyền giá trị từ <i>getListTaskHarvestForAdjust</i> API`,
  })
  @ApiBody({
    type: GetInfoTaskHarvestForAdjustDto,
  })
  @Post('getInfoTaskHarvestForAdjust')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetInfoTaskHarvestForAdjustResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getInfoTaskHarvestForAdjust(@Body() dto: GetInfoTaskHarvestForAdjustDto, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.todoHarvestAppService.getInfoTaskHarvestForAdjust(user.userCode, dto);
    return result;
  }

  @ApiOperation({
    summary: 'Điều chỉnh dữ liệu thu hoạch chưa được yêu cầu tạo mã Qrcode',
  })
  @Post('adjustTaskHarvest')
  @ApiBody({
    type: AdjustHarvestTaskDto,
    description: `
Dữ liệu này được truyền giá trị từ <i>getInfoTaskHarvestForAdjust</i> API\n
<ul>
  <li><b>seq</b>: Mã thứ tự </li>
  <li><b>userHomeCode</b>: Mã nhà yến
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
</ul>
`,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  @ApiBadRequestResponse({ type: NumberErrResponseDto })
  async adjustTaskHarvest(@GetUserApp() user: TokenUserAppResDto, @Body() dto: AdjustHarvestTaskDto) {
    const result = await this.todoHarvestAppService.adjustTaskHarvest(user.userCode, dto);
    if (result == -1) {
      throw new BadRequestException({
        message: Msg.ThisHarvestRequestQrcodeAlreadyCannotAdjust,
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
}
