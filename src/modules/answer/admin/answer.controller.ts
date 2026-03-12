import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, BadRequestException, Delete, Param, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { AnswerAdminService } from './answer.service';
import { CreateAnswerDto, GetAllAnswerDto, UpdateAnswerDto } from './answer.dto';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { ListResponseDto } from "src/dto/common.dto";
import { AnswerResDto } from "../answer.response";
import { TokenUserAdminResDto } from "src/modules/auth/admin/auth.dto";

@ApiBearerAuth('admin-auth')
@ApiTags('admin/answer')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/answer')
export class AnswerAdminController {
  constructor(private readonly answerAdminService: AnswerAdminService) {}

  @ApiBody({
    type: GetAllAnswerDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: GetAllAnswerDto): Promise<{ total: number; list: AnswerResDto[] }> {
    const result = await this.answerAdminService.getAll(dto);
    return result;
  }

  @Get('getDetail/:answerCode')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'answerCode', type: String })
  async getDetail(@Param('answerCode') answerCode: string): Promise<AnswerResDto | null> {
    const result = await this.answerAdminService.getDetail(answerCode);
    if (!result) {
      throw new BadRequestException();
    }
    return result;
  }

  @ApiBody({ type: CreateAnswerDto })
  @Post('create')
  @HttpCode(HttpStatus.OK)
  async create(@Body() dto: CreateAnswerDto, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    const result = await this.answerAdminService.create(dto, admin.userId);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @ApiBody({ type: UpdateAnswerDto })
  @ApiParam({ name: 'answerCode', type: String })
  @Put('update/:answerCode')
  @HttpCode(HttpStatus.OK)
  async update(@Body() dto: UpdateAnswerDto, @Param('answerCode') answerCode: string,  @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    const result = await this.answerAdminService.update(dto, admin.userId, answerCode);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @Delete('delete/:answerCode')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'answerCode', type: String })
  async delete(@Param('answerCode') answerCode: string): Promise<number> {
    const result = await this.answerAdminService.delete(answerCode);
    if (result === 0) {
      throw new BadRequestException();
    }

    return result;
  }
}
