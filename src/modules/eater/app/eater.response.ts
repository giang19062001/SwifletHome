import { ApiProperty } from '@nestjs/swagger';

export class EaterAuthResDto {
  @ApiProperty({ example: 'EAT000001', description: 'Mã người ăn yến' })
  eaterCode: string;

  @ApiProperty({ example: 'eyJhbGciOi...', description: 'JWT Access Token' })
  accessToken: string;
}
