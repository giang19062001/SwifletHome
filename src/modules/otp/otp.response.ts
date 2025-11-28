import { ApiProperty } from "@nestjs/swagger";

export class RequestOtpResDto {
  @ApiProperty({ example: '4321' })
  otpCode: string;
}
