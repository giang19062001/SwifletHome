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
import { PagingDto } from 'src/common/interface/dto';
import { IList } from 'src/common/interface/common';

import { ApiAuthGuard } from 'src/auth/admin/auth.api.guard';
import { AnswerAdminService } from './answer.service';
import { IAnswer } from '../answer.interface';
import {
  AnswerDetailDto,
  GetAllAnswerDto,
  UpdateAnswerDto,
} from './answer.dto';

@ApiTags('admin/answer')
@UseGuards(ApiAuthGuard)
@Controller('/api/admin/answer')
export class AnswerAdminController {
  constructor(private readonly answerService: AnswerAdminService) {}

  @ApiBody({
    type: GetAllAnswerDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: GetAllAnswerDto): Promise<IList<IAnswer>> {
    const result = await this.answerService.getAll(dto);
    return result;
  }

  @ApiBody({ type: AnswerDetailDto })
  @Post('getDetail')
  @HttpCode(HttpStatus.OK)
  async getDetail(
    @Body() body: AnswerDetailDto,
  ): Promise<IAnswer | null> {
    const result = await this.answerService.getDetail(body.answerCode);
    return result;
  }

  @ApiBody({ type: UpdateAnswerDto })
  @Put('updateAnswer')
  @HttpCode(HttpStatus.OK)
  async updateAnswer(@Body() body: UpdateAnswerDto): Promise<number> {
    console.log(body);
    const result = await this.answerService.updateAnswer(body);
    return result;
  }
}
