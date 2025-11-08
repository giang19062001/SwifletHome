import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, Delete, Param, BadRequestException, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';
import { GetAllCodeDto } from './code.dto';
import { ResponseAppInterceptor } from 'src/interceptors/response';
import { ICode } from './code.interface';
import { CodeService } from './code.service';

@ApiTags('app/code')
@Controller('/api/app/code')
@UseInterceptors(ResponseAppInterceptor)
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @ApiBody({
    description: '**subCode:** `STATUS`, `NUMBER_PERSON`',
    type: GetAllCodeDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: GetAllCodeDto): Promise<ICode[]> {
    const result = await this.codeService.getAll(dto);
    return result;
  }
}
