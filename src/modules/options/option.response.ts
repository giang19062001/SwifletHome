import { ApiProperty } from '@nestjs/swagger';

export class GetOptionResDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: 'COD000001' })
  code: string;

  @ApiProperty({ example: 'SIGHTSEEING' })
  mainOption: string;

  @ApiProperty({ example: 'NUMBER_ATTEND' })
  subOption: string;

  @ApiProperty({ example: '3-5' })
  keyOption: string;

  @ApiProperty({ example: '3 ~ 5 người' })
  valueOption: string;

  @ApiProperty({ example: 1 })
  sortOrder: number;
}
