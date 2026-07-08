import { ApiProperty } from '@nestjs/swagger';

export class RequestOtpAppResDto {
  @ApiProperty({ example: '4321' })
  otpCode: string;
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
