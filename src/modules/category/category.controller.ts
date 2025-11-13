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
import { PagingDto } from 'src/dto/common';
import { CategoryService } from './category.service';
import { IList } from 'src/interfaces/common';
import { ICategory } from './category.interface';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';

@ApiBearerAuth('admin-auth') 
@ApiTags('admin/category')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/category')
export class CategoryController {
  constructor(private readonly catetegoryService: CategoryService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Body() dto: PagingDto,
  ): Promise<IList<ICategory>> {
    const result = await this.catetegoryService.getAll(dto);
    return result;
  }
}
