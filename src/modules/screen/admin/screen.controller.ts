import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Req,
  Get,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PagingDto } from 'src/dto/admin';
import { IList } from 'src/interfaces/admin';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { ScreenAdminService } from './screen.service';
import { IScreen } from '../screen.interface';

@ApiBearerAuth('admin-auth') 
@ApiTags('admin/screen')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/screen')
export class ScreenAdminController {
  constructor(private readonly screenAdminService: ScreenAdminService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Body() dto: PagingDto,
  ): Promise<IList<IScreen>> {
    const result = await this.screenAdminService.getAll(dto);
    return result;
  }
}
