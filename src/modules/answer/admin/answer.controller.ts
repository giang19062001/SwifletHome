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
  BadRequestException,
  Delete,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';

import { ApiAuthGuard } from 'src/modules/auth/admin/auth.api.guard';
import { AnswerAdminService } from './answer.service';
import { IAnswer } from '../answer.interface';
import {
  AnswerDetailDto,
  CreateAnswerDto,
  GetAllAnswerDto,
  UpdateAnswerDto,
} from './answer.dto';

@ApiBearerAuth('swf-token') 
@ApiTags('admin/answer')
@UseGuards(ApiAuthGuard)
@Controller('/api/admin/answer')
export class AnswerAdminController {
  constructor(private readonly answerAdminService: AnswerAdminService) {}

  @ApiBody({
    type: GetAllAnswerDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: GetAllAnswerDto): Promise<IList<IAnswer>> {
    const result = await this.answerAdminService.getAll(dto);
    return result;
  }

  @ApiBody({ type: AnswerDetailDto })
  @Post('getDetail')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Body() body: AnswerDetailDto): Promise<IAnswer | null> {
    const result = await this.answerAdminService.getDetail(body.answerCode);
    return result;
  }

  @ApiBody({ type: CreateAnswerDto })
  @Post('createAnswer')
  @HttpCode(HttpStatus.OK)
  async createAnswer(@Body() body: CreateAnswerDto): Promise<number> {
    const result = await this.answerAdminService.createAnswer(body);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
  @ApiBody({ type: UpdateAnswerDto })
  @Put('updateAnswer')
  @HttpCode(HttpStatus.OK)
  async updateAnswer(@Body() body: UpdateAnswerDto): Promise<number> {
    const result = await this.answerAdminService.updateAnswer(body);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @Delete('deleteAnswer/:answerCode')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'answerCode', type: String })
  async deleteAnswer(@Param('answerCode') answerCode: string): Promise<number> {
    const result = await this.answerAdminService.deleteAnswer(answerCode);
    if (result === 0) {
      throw new BadRequestException();
    }

    return result;
  }
}
