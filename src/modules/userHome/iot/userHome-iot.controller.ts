import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorator/auth.decorator';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { ControlSensorCommandDto } from './userHome-iot.dto';
import { UserHomeIotService } from './userHome-iot.service';

@ApiTags('app/sensor')
@Controller('/api/app/sensor')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class UserHomeIotController {
  constructor(private readonly userHomeIotService: UserHomeIotService) {}

  @ApiOperation({
    summary: 'Cung cấp cấu hình cảm biến (macId) cho thiết bị dựa vào machineCode',
  })
  @Public()
  @ApiParam({ name: 'machineCode', type: String })
  @Get('config/:machineCode')
  @HttpCode(HttpStatus.OK)
  async getSensorConfigByMachineCode(@Param('machineCode') machineCode: string) {
    const data = await this.userHomeIotService.getSensorConfigByMachineCode(machineCode);
    return {
      message: 'Lấy cấu hình cảm biến thành công',
      data,
    };
  }

  @ApiOperation({
    summary: 'Gửi lệnh điều khiển (bật/tắt đèn, quạt, bơm) xuống cảm biến nhà yến',
  })
  @ApiParam({ name: 'userHomeCode', type: String, example: 'HOM000058' })
  @ApiBody({ type: ControlSensorCommandDto })
  @Post('command/:userHomeCode')
  @HttpCode(HttpStatus.OK)
  async sendSensorCommand(
    @Param('userHomeCode') userHomeCode: string,
    @Body() dto: ControlSensorCommandDto,
  ) {
    const data = await this.userHomeIotService.sendSensorCommand(userHomeCode, dto);
    return {
      message: 'Gửi lệnh điều khiển thành công',
      data,
    };
  }
}
