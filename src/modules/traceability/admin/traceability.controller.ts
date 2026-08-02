import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { TraceabilityAdminService } from './traceability.service';
import { Msg } from 'src/helpers/message.helper';

@ApiTags('admin/traceability')
@Controller('/api/admin/traceability')
@ApiBearerAuth('admin-auth')
@UseGuards(ApiAuthAdminGuard)
export class TraceabilityAdminController {
  constructor(private readonly service: TraceabilityAdminService) {}

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
