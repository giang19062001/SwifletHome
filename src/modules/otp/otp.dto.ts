import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { Msg } from 'src/helpers/message.helper';

export enum PurposeEnum {
  REGISTER = 'REGISTER',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
}

export class RequestOtpDto {
  @ApiProperty({
    example: '0334644324',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: Msg.PhoneMustNumber })
  userPhone: string;

  @ApiProperty({
    example: PurposeEnum.REGISTER,
    enum: PurposeEnum,
  })
  @IsNotEmpty()
  @IsEnum(PurposeEnum)
  purpose: PurposeEnum;
}

export class VerifyOtpDto {
  @ApiProperty({
    example: '0334644324',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: Msg.PhoneMustNumber })
  userPhone: string;

  @ApiProperty({
    example: '1234',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: Msg.OtpMustNumber })
  otpCode: string;

  @ApiProperty({
    example: PurposeEnum.REGISTER,
    enum: PurposeEnum,
  })
  @IsNotEmpty()
  @IsEnum(PurposeEnum)
  purpose: PurposeEnum;
}
