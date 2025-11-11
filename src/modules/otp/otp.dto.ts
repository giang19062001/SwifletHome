import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({
    example: '0334644324',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'Số điện thoại phải là số' })
  phoneNumber: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    example: '0334644324',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message:'Số điện thoại phải là số'})
  phoneNumber: string;

  @ApiProperty({
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'otp phải là số' })
  otpCode: string;
}
