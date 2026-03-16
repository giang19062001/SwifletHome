import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { TokenUserAdminResDto } from "src/modules/auth/admin/auth.dto";
import { QuestionResDto } from "../question.response";
import { CreateQuestionDto, UpdateQuestionDto } from './question.dto';
import { QuestionAdminService } from './question.service';

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
  async getAll(@Body() dto: PagingDto): Promise<{ total: number; list: QuestionResDto[] }> {
    const result = await this.questionAdminService.getAll(dto);
    return result;
  }

  @ApiParam({ name: 'questionCode', type: String })
  @Get('getDetail/:questionCode')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('questionCode') questionCode: string): Promise<QuestionResDto | null> {
    const result = await this.questionAdminService.getDetail(questionCode);
    if (!result) {
      throw new BadRequestException();
    }
    return result;
  }

  @ApiBody({ type: CreateQuestionDto })
  @Post('create')
  @HttpCode(HttpStatus.OK)
  async create(@Body() dto: CreateQuestionDto, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    const result = await this.questionAdminService.create(dto, admin.userId);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @ApiBody({ type: UpdateQuestionDto })
  @ApiParam({ name: 'questionCode', type: String })
  @Put('update/:questionCode')
  @HttpCode(HttpStatus.OK)
  async update(@Body() dto: UpdateQuestionDto, @Param('questionCode') questionCode: string,  @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    const result = await this.questionAdminService.update(dto, admin.userId, questionCode);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @Delete('delete/:questionCode')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'questionCode', type: String })
  async delete(@Param('questionCode') questionCode: string): Promise<number> {
    const result = await this.questionAdminService.delete(questionCode);
    if (result === 0) {
      throw new BadRequestException();
    }

    return result;
  }
}
