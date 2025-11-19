import { ApiAppResponse } from './../../../interfaces/app';
import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseInterceptors, Put, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { LoginAppDto, RegisterAppDto, UpdateDeviceTokenDto, UpdatePasswordDto, UpdateUserDto } from './auth.dto';
import { AuthAppService } from './auth.service';
import { ResponseAppInterceptor } from 'src/interceptors/response';
import { RequestOtpDto, ResRequestOtpDto, VerifyOtpDto } from 'src/modules/otp/otp.dto';
import { Msg } from 'src/helpers/message';
import { ApiAuthAppGuard } from './auth.guard';
import { GetUserApp } from 'src/decorator/auth';
import * as userInterface from 'src/modules/user/app/user.interface';
import { ApiAppResponseDto } from 'src/dto/app';
import { ResUserAppInfoDto, ResUserAuthAppDto } from 'src/modules/user/app/user.dto';

@ApiBearerAuth('app-auth')
@ApiTags('app/auth')
@Controller('/api/app/auth')
@UseInterceptors(ResponseAppInterceptor)
export class AuthAppController {
  constructor(private readonly authAppService: AuthAppService) {}

  @ApiBody({
    type: LoginAppDto,
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ResUserAuthAppDto) })
  async login(@Body() dto: LoginAppDto) {
    const user = await this.authAppService.login(dto);
    return user;
  }
  @ApiBody({
    type: RegisterAppDto,
  })
  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(Number) })
  async register(@Body() dto: RegisterAppDto) {
    const result = await this.authAppService.register(dto);
    return {
      message: result ? Msg.RegisterOk : Msg.RegisterErr,
      data: result,
    };
  }

  @Get('getInfo')
  @UseGuards(ApiAuthAppGuard)
  @ApiOperation({
    summary: 'Cần xác thực',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ResUserAppInfoDto) })
  async getInfo(@GetUserApp() user: userInterface.IUserAppInfo): Promise<userInterface.IUserAppInfo | null> {
    const result = await this.authAppService.getInfo(user.userCode);
    return result;
  }

  @ApiParam({ name: 'userPhone', type: String })
  @ApiBody({ type: UpdateUserDto })
  @Put('update/:userPhone')
  @UseGuards(ApiAuthAppGuard)
  @ApiOperation({
    summary: 'Cần xác thực',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(Number) })
  async update(@GetUserApp() user: userInterface.IUserApp, @Body() dto: UpdateUserDto, @Param('userPhone') userPhone: string, @Req() req: Request) {
    const result = await this.authAppService.update(dto, userPhone, user.userCode);
    return {
      message: result ? Msg.UpdateOk : Msg.UpdateErr,
      data: result,
    };
  }

  @ApiParam({ name: 'userPhone', type: String })
  @ApiBody({ type: UpdateDeviceTokenDto })
  @Put('updateDeviceToken/:userPhone')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(Number) })
  async updateDeviceToken(@Body() dto: UpdateDeviceTokenDto, @Param('userPhone') userPhone: string) {
    const result = await this.authAppService.updateDeviceToken(dto, userPhone);
    return { data: result };
  }

  @ApiParam({ name: 'userPhone', type: String })
  @ApiBody({ type: UpdatePasswordDto })
  @Put('updatePassword/:userPhone')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(Number) })
  async updatePassword(@Body() dto: UpdatePasswordDto, @Param('userPhone') userPhone: string) {
    const result = await this.authAppService.updatePassword(dto, userPhone);
    return {
      message: result ? Msg.PasswordChangeOk : Msg.PasswordChangeErr,
      data: result,
    };
  }

  @ApiParam({ name: 'userPhone', type: String })
  @ApiOperation({
    summary: 'Nên kiểm tra SĐT đã tồn tại hay chưa trước khi đăng ký',
  })
  @Get('checkDuplicatePhone/:userPhone')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(Number) })
  async checkDuplicatePhone(@Param('userPhone') userPhone: string) {
    const result = await this.authAppService.checkDuplicatePhone(userPhone);
    return {
      message: !result ? Msg.PhoneExist : Msg.PhoneOk,
      data: result,
    };
  }

  @ApiBody({
    description: '**purpose:** `REGISTER`, `FORGOT_PASSWORD`',
    type: RequestOtpDto,
  })
  @Post('requestOtp')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ResRequestOtpDto) })
  async requestOtp(@Body() dto: RequestOtpDto) {
    const otpCode = await this.authAppService.requestOtp(dto);
    return {
      message: Msg.OtpSent,
      data: { otpCode },
    };
  }

  @ApiBody({
    description: '**purpose:** `REGISTER`, `FORGOT_PASSWORD`',
    type: VerifyOtpDto,
  })
  @Post('verifyOtp')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(Number) })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const isValid = await this.authAppService.verifyOtp(dto);

    return {
      success: isValid,
      message: isValid ? Msg.OtpValid : Msg.OtpInvalid,
      data: isValid ? 1 : 0,
    };
  }
}
