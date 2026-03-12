import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PagingDto } from 'src/dto/admin.dto';
import { CategoryAdminService } from './category.service';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { ListResponseDto } from "src/dto/common.dto";
import { CategoryResDto } from "../category.response";

@ApiBearerAuth('admin-auth')
@ApiTags('admin/category')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/category')
export class CategoryAdminController {
  constructor(private readonly categoryAdminService: CategoryAdminService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: PagingDto): Promise<{ total: number; list: CategoryResDto[] }> {
    const result = await this.categoryAdminService.getAll(dto);
    return result;
  }
}
