import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class PagingDto {
  @ApiProperty({
    example: 10,
  })
  @IsNumber()
  @IsNotEmpty()
  limit: number;

  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  page: number;
}
