import { ApiProperty } from '@nestjs/swagger';

export class GuestConsulationResDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: '0123456789' })
  phone: string;

  @ApiProperty({ example: 'Khám bệnh nhà yến' })
  issueInterest: string;

  @ApiProperty({ example: 'Mô tả chi tiết vấn đề' })
  issueDescription: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}
