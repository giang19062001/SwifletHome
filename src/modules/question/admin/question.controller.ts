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
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
} from './question.dto';
import { ApiAuthGuard } from 'src/modules/auth/admin/auth.api.guard';
import { QuestionAdminService } from './question.service';
import { IQuestion } from '../question.interface';

@ApiBearerAuth('swf-token')
@ApiTags('admin/question')
@UseGuards(ApiAuthGuard)
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
    return result;
  }

  @ApiBody({ type: CreateQuestionDto })
  @Post('createQuestion')
  @HttpCode(HttpStatus.OK)
  async createQuestion(@Body() dto: CreateQuestionDto): Promise<number> {
    const result = await this.questionAdminService.createQuestion(dto);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @ApiBody({ type: UpdateQuestionDto })
  @ApiParam({ name: 'questionCode', type: String })
  @Put('updateQuestion/:questionCode')
  @HttpCode(HttpStatus.OK)
  async updateQuestion(@Body() dto: UpdateQuestionDto,  @Param('questionCode') questionCode: string): Promise<number> {
    const result = await this.questionAdminService.updateQuestion(dto, questionCode);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @Delete('deleteQuestion/:questionCode')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'questionCode', type: String })
  async updateAnswer(
    @Param('questionCode') questionCode: string,
  ): Promise<number> {
    const result = await this.questionAdminService.deleteQuestion(questionCode);
    if (result === 0) {
      throw new BadRequestException();
    }

    return result;
  }
}
