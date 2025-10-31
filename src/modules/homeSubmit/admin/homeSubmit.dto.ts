import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateStatusDto {

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  statusCode: string;

  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  updatedId: string;
}
