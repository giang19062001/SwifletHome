// src/otp/otp.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, UseInterceptors } from '@nestjs/common';
import { OtpService } from './otp.service';
import { RequestOtpDto, VerifyOtpDto } from './otp.dto';
import { ResponseAppInterceptor } from 'src/interceptors/response';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('app/otp')
@Controller('/api/app/otp')
@UseInterceptors(ResponseAppInterceptor)
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @ApiBody({
    type: RequestOtpDto,
  })
  @Post('request')
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body() requestOtpDto: RequestOtpDto) {
    const otpCode = await this.otpService.generateOtp(requestOtpDto.phoneNumber);

    return {
      success: true,
      message: 'OTP đã được gửi',
      data: { otpCode },
    };
  }

  @ApiBody({
    type: VerifyOtpDto,
  })
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const isValid = await this.otpService.verifyOtp(verifyOtpDto.phoneNumber, verifyOtpDto.otpCode);

    return {
      success: isValid,
      message: isValid ? 'Xác thực OTP thành công' : 'Xác thực OTP thất bại',
    };
  }
}
