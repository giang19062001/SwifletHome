import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards, BadRequestException, Param, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { ConsignmentAdminService } from './consignment.service';
import { ConsignmentResDto } from './consignment.response';
import { UpdateConsignmentDto } from './consignment.dto';

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

  @ApiParam({ name: 'consignmentCode', type: String })
  @Get('getDetail/:consignmentCode')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('consignmentCode') consignmentCode: string): Promise<ConsignmentResDto | null> {
    const result = await this.consignmentAdminService.getDetail(consignmentCode);
    if (!result) {
      throw new BadRequestException();
    }
    return result;
  }

  @ApiParam({ name: 'consignmentCode', type: String })
  @ApiBody({ type: UpdateConsignmentDto })
  @Put('update/:consignmentCode')
  @HttpCode(HttpStatus.OK)
  async update(@Param('consignmentCode') consignmentCode: string, @Body() dto: UpdateConsignmentDto): Promise<number> {
    const result = await this.consignmentAdminService.update(consignmentCode, dto);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
}
