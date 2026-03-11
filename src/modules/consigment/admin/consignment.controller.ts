import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { ConsignmentAdminService } from './consignment.service';
import { IConsignment } from './consignment.interface';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/consignment')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/consignment')
export class ConsignmentAdminController {
  constructor(private readonly consignmentAdminService: ConsignmentAdminService) {}

  // TODO: TEAM
  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: PagingDto): Promise<IList<IConsignment>> {
    const result = await this.consignmentAdminService.getAll(dto);
    return result;
  }
}
