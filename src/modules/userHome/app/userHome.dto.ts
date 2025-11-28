import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID, ValidateNested } from 'class-validator';
import { YnEnum } from 'src/interfaces/admin.interface';

export class UploadUserHomeImageDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    description: 'Luôn được generate phía app (uuid)',
  })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  userHomeImage: any;
}

export class MutationUserHomeDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userHomeName: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userHomeAddress: string;

  @ApiProperty({
    example: 0,
  })
  @IsString()
  @IsNotEmpty()
  userHomeProvince: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  userHomeDescription: string;

  @ApiProperty({
    example: YnEnum.N,
    enum: YnEnum,
  })
  @IsEnum(YnEnum)
  @IsNotEmpty()
  isIntegateTempHum: YnEnum;

  @ApiProperty({
    example: YnEnum.N,
    enum: YnEnum,
  })
  @IsEnum(YnEnum)
  @IsNotEmpty()
  isIntegateCurrent: YnEnum;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;
}

