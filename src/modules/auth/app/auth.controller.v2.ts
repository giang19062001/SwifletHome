import { ApiAppResponse } from '../../../interfaces/app.interface';
import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseInterceptors, Put, Param, UseGuards, Delete, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { LoginAppDto, RegisterUserAppDto, RegisterUserAppV2Dto, UpdateDeviceTokenDto, UpdatePasswordDto, UpdateUserDto } from './auth.dto';
import { AuthAppService } from './auth.service';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { RequestOtpDto, VerifyOtpDto } from 'src/modules/otp/otp.dto';
import { Msg } from 'src/helpers/message.helper';
import { ApiAuthAppGuard } from './auth.guard';
import { GetUserApp } from 'src/decorator/auth.decorator';
import * as userInterface from 'src/modules/user/app/user.interface';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { GetInfoUserAppResDto, LoginResDto } from 'src/modules/user/app/user.response';
import { RequestOtpResDto } from 'src/modules/otp/otp.response';
import * as authInterface from './auth.interface';
import { NumberOkResponseDto } from 'src/dto/common.dto';

@ApiBearerAuth('app-auth')
@ApiTags('app/v2/auth')
@Controller('/api/app/v2/auth')
@UseInterceptors(ResponseAppInterceptor)
export class AuthAppControllerV2 {
  constructor(private readonly authAppService: AuthAppService) {}

  @ApiBody({
    type: RegisterUserAppV2Dto,
  })
  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  async register(@Body() dto: RegisterUserAppV2Dto) {
    const result = await this.authAppService.register(dto);
    if (result === 0) {
      throw new BadRequestException({ message: Msg.RegisterAccountErr, data: 0 });
    }
    return {
      message: Msg.RegisterAccountOk,
      data: result,
    };
  }

}
