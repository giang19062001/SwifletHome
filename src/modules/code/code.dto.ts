import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetAllCodeDto {
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
}
