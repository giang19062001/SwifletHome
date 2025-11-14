import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetCodeDto {
  @ApiProperty({
    example: 'SUBMIT',
  })
  @IsString()
  @IsNotEmpty()
  mainCode: string;

  @ApiProperty({
    example: 'NUMBER_ATTEND',
  })
  @IsString()
  @IsNotEmpty()
  subCode: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsOptional()
  keyCode?: string;
}
