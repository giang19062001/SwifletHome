import { ApiProperty } from '@nestjs/swagger';
export class RequestOtpAppResDto {
  @ApiProperty({ example: '4321' })
  otpCode: string;
}
