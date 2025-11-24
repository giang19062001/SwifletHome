import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class DoctorFileDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    description: 'Luôn được generate phía app (uuid)',
  })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Tối đa 5 file (ảnh, video)',
  })
  doctorFiles: any[];
}

export class ResDoctorFileStrDto {
  @ApiProperty({ example: '' })
  filename: string;
}

class DoctorFileStrDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  filename: string;
}
export class CreateDoctorDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userPhone: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  note: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;

  // @ApiProperty({
  //   type: [DoctorFileStrDto],
  // })
  // @IsArray()
  // @ArrayMinSize(1)
  // doctorFiles: DoctorFileStrDto[];
}
