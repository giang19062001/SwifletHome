import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, Delete, Param, BadRequestException, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';
import { CodeAppService } from './code.service';
import { ICode } from '../code.interface';
import { GetAllCodeDto } from './code.dto';
import { ResponseInterceptor } from 'src/interceptors/response';

@ApiTags('app/code')
@Controller('/api/app/code')
@UseInterceptors(ResponseInterceptor)
export class CodeAppController {
  constructor(private readonly questionAdminService: CodeAppService) {}

  @ApiBody({
    description: '**subCode:** `STATUS`, `NUMBER_PERSON`',
    type: GetAllCodeDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: GetAllCodeDto): Promise<ICode[]> {
    const result = await this.questionAdminService.getAll(dto);
    return result;
  }
}
