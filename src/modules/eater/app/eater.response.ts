import { ApiProperty } from '@nestjs/swagger';

export class EaterAuthResDto {
  @ApiProperty({ example: 1, description: 'Số thứ tự tự tăng' })
  seq?: number;

  @ApiProperty({ example: 'EAT000001', description: 'Mã người ăn yến' })
  eaterCode: string;

  @ApiProperty({ example: 'EATER', description: 'Từ khóa loại người dùng (Người ăn yến)' })
  userTypeKeyWord: string;

  @ApiProperty({ example: 'eyJhbGciOi...', description: 'JWT Access Token' })
  accessToken: string;
}
