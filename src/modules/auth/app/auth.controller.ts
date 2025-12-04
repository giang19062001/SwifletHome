import { ApiAppResponse } from '../../../interfaces/app.interface';
import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseInterceptors, Put, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { LoginAppDto, RegisterUserAppDto, UpdateDeviceTokenDto, UpdatePasswordDto, UpdateUserDto } from './auth.dto';
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
  @ApiOkResponse({ type: ApiAppResponseDto(LoginResDto) })
  async login(@Body() dto: LoginAppDto) {
    const result = await this.authAppService.login(dto);
    return {
      message: result ? Msg.LoginOk : Msg.LoginErr,
      data: result,
    };
  }
  @ApiBody({
    type: RegisterUserAppDto,
  })
  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(Number) })
  async register(@Body() dto: RegisterUserAppDto) {
    const result = await this.authAppService.register(dto);
    return {
      message: result ? Msg.RegisterAccountOk : Msg.RegisterAccountErr,
      data: result,
    };
  }

  @Get('getInfo')
  @UseGuards(ApiAuthAppGuard)
  @ApiOperation({
    summary: 'Cần xác thực',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetInfoUserAppResDto) })
  async getInfo(@GetUserApp() user: authInterface.ITokenUserApp) {
    const result = await this.authAppService.getInfo(user.userCode);
    return {
      message: result ? Msg.GetOk : Msg.GetErr,
      data: result,
    };
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
  async update(@GetUserApp() user: authInterface.ITokenUserApp, @Body() dto: UpdateUserDto, @Param('userPhone') userPhone: string, @Req() req: Request) {
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
    return {
      message: result ? Msg.UpdateOk : Msg.UpdateErr,
      data: result,
    };
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
  @ApiOkResponse({ type: ApiAppResponseDto(RequestOtpResDto) })
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
