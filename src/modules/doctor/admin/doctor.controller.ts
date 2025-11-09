import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, Delete, Param, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';
import { ApiAuthGuard } from 'src/modules/auth/admin/auth.api.guard';
import { DoctorAdminService } from './doctor.service';
import { IDoctor } from '../doctor.interface';
import { UpdateDoctorDto } from './doctor.dto';

@ApiBearerAuth('swf-token')
@ApiTags('admin/doctor')
@UseGuards(ApiAuthGuard)
@Controller('/api/admin/doctor')
export class DoctorAdminController {
  constructor(private readonly doctorAdminService: DoctorAdminService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: PagingDto): Promise<IList<IDoctor>> {
    const result = await this.doctorAdminService.getAll(dto);
    return result;
  }

  @ApiParam({ name: 'seq', type: Number })
  @Get('getDetail/:seq')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('seq') seq: number): Promise<IDoctor | null> {
    const result = await this.doctorAdminService.getDetail(seq);
    if (!result) {
      throw new BadRequestException();
    }
    return result;
  }

  @ApiBody({ type: UpdateDoctorDto })
  @ApiParam({ name: 'seq', type: Number })
  @Put('updateDoctor/:seq')
  @HttpCode(HttpStatus.OK)
  async updateDoctor(@Body() dto: UpdateDoctorDto, @Param('seq') seq: number): Promise<number> {
    const result = await this.doctorAdminService.updateDoctor(dto, seq);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
}
