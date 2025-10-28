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
import { PagingDto } from 'src/interfaces/dto';
import { IList } from 'src/interfaces/common';
import {
  CreateQuestionDto,
  QuestionDetailDto,
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

  @ApiBody({ type: QuestionDetailDto })
  @Post('getDetail')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Body() body: QuestionDetailDto): Promise<IQuestion | null> {
    const result = await this.questionAdminService.getDetail(body.questionCode);
    return result;
  }

  @ApiBody({ type: CreateQuestionDto })
  @Post('createQuestion')
  @HttpCode(HttpStatus.OK)
  async createQuestion(@Body() body: CreateQuestionDto): Promise<number> {
    const result = await this.questionAdminService.createQuestion(body);
      if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @ApiBody({ type: UpdateQuestionDto })
  @Put('updateQuestion')
  @HttpCode(HttpStatus.OK)
  async updateQuestion(@Body() body: UpdateQuestionDto): Promise<number> {
    const result = await this.questionAdminService.updateQuestion(body);
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
