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
import { CateFaqService } from './categoryFaq.service';
import { IList } from 'src/interfaces/common';
import { ICategoryFaq } from './categoryFaq.interface';
import { ApiAuthGuard } from 'src/modules/auth/admin/auth.api.guard';

@ApiBearerAuth('swf-token') 
@ApiTags('admin/categoryFaq')
@UseGuards(ApiAuthGuard)
@Controller('/api/admin/categoryFaq')
export class CateFaqController {
  constructor(private readonly cateFaqService: CateFaqService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Body() dto: PagingDto,
  ): Promise<IList<ICategoryFaq>> {
    const result = await this.cateFaqService.getAll(dto);
    return result;
  }
}
