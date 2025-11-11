import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, Delete, Param, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { HomeSubmitAdminService } from './homeSubmit.service';
import { IHomeSubmit } from '../homeSubmit.interface';
import { UpdateStatusDto } from './homeSubmit.dto';

@ApiBearerAuth('swf-token')
@ApiTags('admin/homeSubmit')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/homeSubmit')
export class HomeSubmitAdminController {
  constructor(private readonly homeSubmitAdminService: HomeSubmitAdminService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: PagingDto): Promise<IList<IHomeSubmit>> {
    const result = await this.homeSubmitAdminService.getAll(dto);
    return result;
  }

  
    @ApiBody({ type: UpdateStatusDto })
    @ApiParam({ name: 'seq', type: Number })
    @Put('updateStatus/:seq')
    @HttpCode(HttpStatus.OK)
    async updateStatus(@Body() dto: UpdateStatusDto,  @Param('seq') seq: number): Promise<number> {
      const result = await this.homeSubmitAdminService.updateStatus(dto, seq);
      if (result === 0) {
        throw new BadRequestException();
      }
      return result;
    }
  

  @ApiParam({ name: 'seq', type: Number })
  @Get('getDetail/:seq')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('seq') seq: number): Promise<IHomeSubmit | null> {
    const result = await this.homeSubmitAdminService.getDetail(seq);
    if(!result){
      throw new BadRequestException()
    }
    return result;
  }
}
