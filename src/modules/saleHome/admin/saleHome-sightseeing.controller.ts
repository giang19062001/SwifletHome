import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { TokenUserAdminResDto } from '../../auth/admin/auth.response';
import { SaleHomeSightseeingAdminService } from './saleHome-sightseeing.service';
import { UpdateStatusSightseeingDto } from './saleHome.dto';
import { SaleHomeSightSeeingAdminResDto } from './saleHome.response';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/homeSale')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/homeSale')
export class SaleHomeSightseeingAdminController {
  constructor(private readonly saleHomeSightseeingAdminService: SaleHomeSightseeingAdminService) {}

  // TODO: SIGHTSEEING
  @ApiBody({
    type: PagingDto,
  })
  @Post('getAllSightseeing')
  @HttpCode(HttpStatus.OK)
  async getAllSightseeing(@Body() dto: PagingDto): Promise<{ total: number; list: SaleHomeSightSeeingAdminResDto[] }> {
    const result = await this.saleHomeSightseeingAdminService.getAllSightseeing(dto);
    return result;
  }

  @ApiBody({ type: UpdateStatusSightseeingDto })
  @ApiParam({ name: 'seq', type: Number })
  @Put('updateSightseeing/:seq')
  @HttpCode(HttpStatus.OK)
  async updateSightseeing(@Body() dto: UpdateStatusSightseeingDto, @Param('seq') seq: number, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    const result = await this.saleHomeSightseeingAdminService.updateSightseeing(dto, admin.userId, seq);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @ApiParam({ name: 'seq', type: Number })
  @Get('getDetailSightseeing/:seq')
  @HttpCode(HttpStatus.OK)
  async getDetailSightseeing(@Param('seq') seq: number): Promise<SaleHomeSightSeeingAdminResDto | null> {
    const result = await this.saleHomeSightseeingAdminService.getDetailSightseeing(seq);
    if (!result) {
      throw new BadRequestException();
    }
    return result;
  }
}
