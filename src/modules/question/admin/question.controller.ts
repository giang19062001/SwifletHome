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
  Put,
  Delete,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PagingDto } from 'src/dto/admin';
import { IList } from 'src/interfaces/admin';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
} from './question.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { QuestionAdminService } from './question.service';
import { IQuestion } from '../question.interface';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/question')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/question')
export class QuestionAdminController {
  constructor(private readonly questionAdminService: QuestionAdminService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: PagingDto): Promise<IList<IQuestion>> {
    const result = await this.questionAdminService.getAll(dto);
    return result;
  }

  @ApiParam({ name: 'questionCode', type: String })
  @Get('getDetail/:questionCode')
  @HttpCode(HttpStatus.OK)
  async getDetail(
    @Param('questionCode') questionCode: string,
  ): Promise<IQuestion | null> {
    const result = await this.questionAdminService.getDetail(questionCode);
     if(!result){
      throw new BadRequestException()
    }
    return result;
  }

  @ApiBody({ type: CreateQuestionDto })
  @Post('create')
  @HttpCode(HttpStatus.OK)
  async create(@Body() dto: CreateQuestionDto): Promise<number> {
    const result = await this.questionAdminService.create(dto);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @ApiBody({ type: UpdateQuestionDto })
  @ApiParam({ name: 'questionCode', type: String })
  @Put('update/:questionCode')
  @HttpCode(HttpStatus.OK)
  async update(@Body() dto: UpdateQuestionDto,  @Param('questionCode') questionCode: string): Promise<number> {
    const result = await this.questionAdminService.update(dto, questionCode);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @Delete('delete/:questionCode')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'questionCode', type: String })
  async delete(
    @Param('questionCode') questionCode: string,
  ): Promise<number> {
    const result = await this.questionAdminService.delete(questionCode);
    if (result === 0) {
      throw new BadRequestException();
    }

    return result;
  }
}
