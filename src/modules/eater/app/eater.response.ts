import { ApiProperty } from '@nestjs/swagger';

export class EaterAuthResDto {
  @ApiProperty({ example: 'EAT000001', description: 'Mã người ăn yến' })
  eaterCode: string;

  @ApiProperty({ example: 'UST000005', description: 'Mã loại người dùng (Người ăn yến)' })
  userTypeCode: string;

  @ApiProperty({ example: 'eyJhbGciOi...', description: 'JWT Access Token' })
  accessToken: string;
}
