import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { TraceabilityAdminService } from './traceability.service';
import { Msg } from 'src/helpers/message.helper';
import { GetTraceabilityListAdminDto, UpdateTraceabilityStatusAdminDto } from './traceability-admin.dto';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { TokenUserAdminResDto } from 'src/modules/auth/admin/auth.response';

@ApiTags('admin/traceability')
@Controller('/api/admin/traceability')
@ApiBearerAuth('admin-auth')
@UseGuards(ApiAuthAdminGuard)
export class TraceabilityAdminController {
  constructor(private readonly service: TraceabilityAdminService) {}

  @ApiOperation({
    summary: 'Lấy danh sách các đơn/hồ sơ truy xuất nguồn gốc có phân trang và lọc',
  })
  @Post('getList')
  @HttpCode(HttpStatus.OK)
  async getList(@Body() dto: GetTraceabilityListAdminDto) {
    const result = await this.service.getListTraceabilitySubmissions(dto);
    return result;
  }

  @ApiOperation({
    summary: 'Cập nhật trạng thái hồ sơ truy xuất nguồn gốc (APPROVED, REFUSED, PROCESSING)',
  })
  @Put('updateStatus/:seq')
  @HttpCode(HttpStatus.OK)
  async updateStatus(@Param('seq') seq: number, @Body() dto: UpdateTraceabilityStatusAdminDto, @GetUserAdmin() user: TokenUserAdminResDto) {
    const affected = await this.service.updateSubmissionStatus(seq, dto.status, user.userCode || 'ADMIN');
    return {
      message: affected > 0 ? Msg.UpdateOk : Msg.UpdateErr,
      data: affected,
    };
  }

  @ApiOperation({
    summary: 'Lấy toàn bộ biểu mẫu kèm dữ liệu truy xuất nguồn gốc của một traceabilityId',
  })
  @Get('getForm')
  async getForm(@Query('traceabilityId') traceabilityId: string) {
    const result = await this.service.getFormForGlobalView(traceabilityId);
    return {
      message: Msg.GetOk,
      data: result,
    };
  }
}
