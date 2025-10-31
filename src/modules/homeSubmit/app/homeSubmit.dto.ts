import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHomeSubmitDto {
  @ApiProperty({
    example: 'HOM000001',
  })
  @IsString()
  @IsNotEmpty()
  homeCode: string;

  @ApiProperty({
    example: 'USR000001',
  })
  @IsString()
  @IsNotEmpty()
  userCode: string;

  @ApiProperty({
    example: 'Giang',
  })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    example: '0334644324',
  })
  @IsString()
  @IsNotEmpty()
  userPhone: string;

  @ApiProperty({
    example: 'COD000001',
  })
  @IsString()
  @IsNotEmpty()
  numberAttendCode: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  note: string;
}
