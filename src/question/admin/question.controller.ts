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
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PagingDto } from 'src/common/interface/dto';
import { IList } from 'src/common/interface/common';
import { QuestionDetailDto, UpdateQuestionDto } from './question.dto';
import { ApiAuthGuard } from 'src/auth/admin/auth.api.guard';
import { QuestionService } from './question.service';
import { IQuestion } from '../question.interface';

@ApiTags('admin/question')
@UseGuards(ApiAuthGuard)
@Controller('/api/admin/question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: PagingDto): Promise<IList<IQuestion>> {
    const result = await this.questionService.getAll(dto);
    return result;
  }

  @ApiBody({ type: QuestionDetailDto })
  @Post('getDetail')
  @HttpCode(HttpStatus.OK)
  async getDetail(
    @Body() body: QuestionDetailDto,
  ): Promise<IQuestion | null> {
    const result = await this.questionService.getDetail(
      body.questionCode,
    );
    return result;
  }

  @ApiBody({ type: UpdateQuestionDto })
  @Put('updateQuestion')
  @HttpCode(HttpStatus.OK)
  async updateAnswer(@Body() body: UpdateQuestionDto): Promise<number> {
    console.log(body);
    const result = await this.questionService.updateQuestion(body);
    return result;
  }
}
