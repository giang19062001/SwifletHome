import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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

}
