import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export enum PurposeEnum {
  REGISTER = 'REGISTER',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
}

export class CheckPhoneDto {
  @ApiProperty({
    example: '0334644324',
  })
  @IsString()
  @IsNotEmpty()
  userPhone: string;

  @ApiProperty({
    example: '+84',
  })
  @IsString()
  @IsNotEmpty()
  countryCode: string;
}
export class RequestOtpDto {
  @ApiProperty({
    example: '0334644324',
  })
  @IsString()
  @IsNotEmpty()
  userPhone: string;

  @ApiProperty({
    example: PurposeEnum.REGISTER,
    enum: PurposeEnum,
  })
  @IsNotEmpty()
  @IsEnum(PurposeEnum)
  purpose: PurposeEnum;

  @ApiProperty({
    example: '+84',
  })
  @IsString()
  @IsNotEmpty()
  countryCode: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    example: '0334644324',
  })
  @IsString()
  @IsNotEmpty()
  userPhone: string;

  @ApiProperty({
    example: '1234',
  })
  @IsString()
  @IsNotEmpty()
  otpCode: string;

  @ApiProperty({
    example: PurposeEnum.REGISTER,
    enum: PurposeEnum,
  })
  @IsNotEmpty()
  @IsEnum(PurposeEnum)
  purpose: PurposeEnum;

  @ApiProperty({
    example: '+84',
  })
  @IsString()
  @IsNotEmpty()
  countryCode: string;
}

export class OtpResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    userPhone: string;
    @ApiProperty({ example: '' })
    otpCode: string;
    @ApiProperty({ example: 0 })
    attemptCount: number;
    @ApiProperty({ example: 0 })
    maxAttempts: number;
    @ApiProperty({ example: '' })
    expiresAt: string;
    @ApiProperty({ example: '' })
    createdAt: string;
    @ApiProperty({ example: 0 })
    isUsed: number;
}
