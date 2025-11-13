import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseInterceptors, Put, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { LoginAppDto, RegisterAppDto, UpdateDeviceTokenDto, UpdatePasswordDto } from './auth.dto';
import { AuthAppService } from './auth.service';
import { ResponseAppInterceptor } from 'src/interceptors/response';
import { RequestOtpDto, VerifyOtpDto } from 'src/modules/otp/otp.dto';
import { Msg } from 'src/helpers/message';
import { ApiAuthAppGuard } from './auth.guard';

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
  async login(@Body() dto: LoginAppDto) {
    const user = await this.authAppService.login(dto);
    return user;
  }
  @ApiBody({
    type: RegisterAppDto,
  })
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() dto: RegisterAppDto) {
    const result = await this.authAppService.register(dto);
    return {
      message: result ? Msg.RegisterOk : Msg.RegisterErr,
      data: result,
    };
  }

  @ApiParam({ name: 'userPhone', type: String })
  @ApiBody({ type: UpdateDeviceTokenDto })
  @Put('updateDeviceToken/:userPhone')
  @HttpCode(HttpStatus.OK)
  async updateDeviceToken(@Body() dto: UpdateDeviceTokenDto, @Param('userPhone') userPhone: string) {
    const result = await this.authAppService.updateDeviceToken(dto, userPhone);
    return result;
  }

  @UseGuards(ApiAuthAppGuard)
  @ApiOperation({
    summary: 'Cần đăng nhập và xác thực token',
  })
  @ApiParam({ name: 'userPhone', type: String })
  @ApiBody({ type: UpdatePasswordDto })
  @Put('updatePassword/:userPhone')
  @HttpCode(HttpStatus.OK)
  async updatePassword(@Body() dto: UpdatePasswordDto, @Param('userPhone') userPhone: string) {
    const result = await this.authAppService.updatePassword(dto, userPhone);
    return {
      message: result ? Msg.PasswordChangeOk : Msg.PasswordChangeErr,
      data: result,
    };
  }

  @ApiParam({ name: 'userPhone', type: String })
  @Get('checkPhoneDuplicate/:userPhone')
  @HttpCode(HttpStatus.OK)
  async checkPhoneDuplicate(@Param('userPhone') userPhone: string) {
    const user = await this.authAppService.checkPhoneDuplicate(userPhone);
    return user;
  }

  @ApiBody({
    description: '**purpose:** `REGISTER`, `FORGOT_PASSWORD`',
    type: RequestOtpDto,
  })
  @Post('requestOtp')
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body() dto: RequestOtpDto) {
    const otpCode = await this.authAppService.requestOtp(dto);
    return {
      success: true,
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
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const isValid = await this.authAppService.verifyOtp(dto);

    return {
      success: isValid,
      message: isValid ? Msg.OtpValid : Msg.OtpInvalid,
    };
  }
}
