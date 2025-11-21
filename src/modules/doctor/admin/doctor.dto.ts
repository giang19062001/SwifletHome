import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class UpdateDoctorDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  noteAnswered: string;

  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  updatedId: string;
}
