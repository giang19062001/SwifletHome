import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetOptionDto {
  @ApiProperty({
    example: 'SUBMIT',
  })
  @IsString()
  @IsNotEmpty()
  mainOption: string;

  @ApiProperty({
    example: 'NUMBER_ATTEND',
  })
  @IsString()
  @IsNotEmpty()
  subOption: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsOptional()
  keyOption?: string;
}

export class ResOptionDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: 'COD000001' })
  code: string;

  @ApiProperty({ example: 'SUBMIT' })
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
