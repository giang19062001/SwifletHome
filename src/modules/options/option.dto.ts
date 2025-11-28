import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetOptionDto {
  @ApiProperty({
    example: 'SIGHTSEEING',
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

