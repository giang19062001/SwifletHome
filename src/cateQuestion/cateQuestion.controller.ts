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
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PagingDto } from 'src/common/interface/dto';
import { CateQuestionService } from './cateQuestion.service';
import { IList } from 'src/common/interface/common';
import { ICategoryQuestion } from './cateQuestion.interface';
import { ApiAuthGuard } from 'src/auth/admin/auth.api.guard';

@ApiTags('admin/categoryQuestion')
@UseGuards(ApiAuthGuard)
@Controller('/api/admin/categoryQuestion')
export class CateQuestionController {
  constructor(private readonly cateQuestionService: CateQuestionService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Body() dto: PagingDto,
  ): Promise<IList<ICategoryQuestion>> {
    const result = await this.cateQuestionService.getAll(dto);
    return result;
  }
}
