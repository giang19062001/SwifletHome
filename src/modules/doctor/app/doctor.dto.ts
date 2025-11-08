import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class DoctorFileDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    description: 'Được generate phía app khi màn hình mount',
  })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;

  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  createdId: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Tối đa 5 file',
  })
  doctorFiles: any[];
}

class DoctorFileStrDto {
  @ApiProperty({ example: '' })
  filename: string;
}

export class CreateDoctorDto {
  @ApiProperty({
    example: 'USR000001',
  })
  @IsString()
  @IsNotEmpty()
  userCode: string;

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
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  statusCode: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;

  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  createdId: string;

  @ApiProperty({
    type: [DoctorFileStrDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  doctorFiles: DoctorFileStrDto[];
}

export class UpdateDoctorDto extends OmitType(CreateDoctorDto, ['createdId']) {
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
