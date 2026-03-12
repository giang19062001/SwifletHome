import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { YnEnum } from "src/interfaces/admin.interface";

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

export class OpitionResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    code: string;
    @ApiProperty({ example: '' })
    mainOption: string;
    @ApiProperty({ example: '' })
    subOption: string;
    @ApiProperty({ example: '' })
    keyOption: string;
    @ApiProperty({ example: '' })
    valueOption: string;
    @ApiProperty({ example: 0 })
    sortOrder: number;
    @ApiProperty({ example: YnEnum.N })
    isActive: YnEnum;
}
