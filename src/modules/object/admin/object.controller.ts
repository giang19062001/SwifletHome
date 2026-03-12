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
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { ObjectAdminService } from './object.service';
import { ListResponseDto } from "src/dto/common.dto";
import { ObjectResDto } from "../object.response";

@ApiBearerAuth('admin-auth') 
@ApiTags('admin/object')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/object')
export class ObjectAdminController {
  constructor(private readonly objectAdminService: ObjectAdminService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Body() dto: PagingDto,
  ): Promise<{ total: number; list: ObjectResDto[] }> {
    const result = await this.objectAdminService.getAll(dto);
    return result;
  }
}
