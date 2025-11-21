import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, Delete, Param, BadRequestException, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { HomeSubmitAppService } from './homeSubmit.service';
import { CreateHomeSubmitDto } from './homeSubmit.dto';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { Msg } from 'src/helpers/message.helper';
import { GetUserApp } from 'src/decorator/auth.decorator';
import * as userInterface from 'src/modules/user/app/user.interface';

@ApiTags('app/homeSubmit')
@Controller('/api/app/homeSubmit')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class HomeSubmitAppController {
  constructor(private readonly homeSubmitAppService: HomeSubmitAppService) {}

  @ApiBody({
    type: CreateHomeSubmitDto,
    description: "numberAttendCode: mã code từ API getAll (mainCode: 'SUBMIT', subCode: 'NUMBER_ATTEND')",
  })
  @Post('create')
  @HttpCode(HttpStatus.OK)
  async create(@Body() dto: CreateHomeSubmitDto, @GetUserApp() user: userInterface.IUserApp) {
    const result = await this.homeSubmitAppService.create(dto, user.userCode);
    return {
      message: Msg.HomeSummitCreateOk,
      data: result,
    };
  }
}
