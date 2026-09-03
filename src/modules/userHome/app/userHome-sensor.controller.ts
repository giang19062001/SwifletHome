import { Controller, Get, HttpCode, HttpStatus, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorator/auth.decorator';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { UserHomeAppService } from './userHome.service';

@ApiTags('app/sensor')
@Controller('/api/app/sensor')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class UserHomeSensorAppController {
  constructor(private readonly userHomeAppService: UserHomeAppService) {}

  @ApiOperation({
    summary: 'Cung cấp cấu hình cảm biến (macId) cho thiết bị dựa vào machineCode',
  })
  @Public()
  @ApiParam({ name: 'machineCode', type: String })
  @Get('config/:machineCode')
  @HttpCode(HttpStatus.OK)
  async getSensorConfigByMachineCode(@Param('machineCode') machineCode: string) {
    const data = await this.userHomeAppService.getSensorConfigByMachineCode(machineCode);
    return {
      message: 'Lấy cấu hình cảm biến thành công',
      data,
    };
  }
}
