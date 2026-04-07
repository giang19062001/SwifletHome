import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { GetAllGuestConsulationDto } from './guest.dto';
import { GuestAdminService } from './guest.service';
import { GuestConsulationResDto } from './guest.response';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/guest')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/guest')
export class GuestAdminController {
  constructor(private readonly guestAdminService: GuestAdminService) {}

  @ApiBody({ type: GetAllGuestConsulationDto })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: GetAllGuestConsulationDto): Promise<{ total: number; list: GuestConsulationResDto[] }> {
    const result = await this.guestAdminService.getAll(dto);
    return result;
  }
}
