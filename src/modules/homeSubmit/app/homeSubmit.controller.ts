import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, Delete, Param, BadRequestException, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ResponseAppInterceptor } from 'src/interceptors/response';
import { HomeSubmitAppService } from './homeSubmit.service';
import { CreateHomeSubmitDto } from './homeSubmit.dto';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';

@ApiTags('app/homeSubmit')
@Controller('/api/app/homeSubmit')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class HomeSubmitAppController {
  constructor(private readonly homeSubmitAppService: HomeSubmitAppService) {}

  @ApiBody({
    type: CreateHomeSubmitDto,
  })
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateHomeSubmitDto): Promise<number> {
    const result = await this.homeSubmitAppService.create(dto);
    return result;
  }
}
