import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { TokenUserAdminResDto } from "src/modules/auth/admin/auth.dto";
import { DoctorResDto } from "../doctor.response";
import { UpdateDoctorDto } from './doctor.dto';
import { DoctorAdminService } from './doctor.service';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/doctor')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/doctor')
export class DoctorAdminController {
  constructor(private readonly doctorAdminService: DoctorAdminService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: PagingDto): Promise<{ total: number; list: DoctorResDto[] }> {
    const result = await this.doctorAdminService.getAll(dto);
    return result;
  }

  @ApiParam({ name: 'seq', type: Number })
  @Get('getDetail/:seq')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('seq') seq: number): Promise<DoctorResDto | null> {
    const result = await this.doctorAdminService.getDetail(seq);
    if (!result) {
      throw new BadRequestException();
    }
    return result;
  }

  @ApiBody({ type: UpdateDoctorDto })
  @ApiParam({ name: 'seq', type: Number })
  @Put('update/:seq')
  @HttpCode(HttpStatus.OK)
  async update(@Body() dto: UpdateDoctorDto, @Param('seq') seq: number,  @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    const result = await this.doctorAdminService.update(dto, admin.userId, seq);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
}
