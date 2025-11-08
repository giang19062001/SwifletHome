import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, Delete, Param, BadRequestException, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ResponseAppInterceptor } from 'src/interceptors/response';
import { HomeSubmitAppService } from './homeSubmit.service';
import { CreateHomeSubmitDto } from './homeSubmit.dto';

@ApiTags('app/homeSubmit')
@Controller('/api/app/homeSubmit')
@UseInterceptors(ResponseAppInterceptor)
export class HomeSubmitAppController {
  constructor(private readonly homeSubmitAppService: HomeSubmitAppService) {}

  @ApiBody({
    type: CreateHomeSubmitDto,
  })
  @Post('createHomeSubmit')
  @HttpCode(HttpStatus.OK)
  async createHomeSubmit(@Body() dto: CreateHomeSubmitDto): Promise<number> {
    const result = await this.homeSubmitAppService.createHomeSubmit(dto);
    return result;
  }
}
