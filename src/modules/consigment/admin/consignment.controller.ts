import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { ConsignmentAdminService } from './consignment.service';
import { ListResponseDto } from "src/dto/common.dto";
import { ConsignmentResDto } from "./consignment.response";

@ApiBearerAuth('admin-auth')
@ApiTags('admin/consignment')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/consignment')
export class ConsignmentAdminController {
  constructor(private readonly consignmentAdminService: ConsignmentAdminService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: PagingDto): Promise<{ total: number; list: ConsignmentResDto[] }> {
    const result = await this.consignmentAdminService.getAll(dto);
    return result;
  }
}
