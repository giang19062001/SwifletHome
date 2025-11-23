import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID, ValidateNested } from 'class-validator';
import { YnEnum } from 'src/interfaces/admin.interface';

// REQUEST
export class UploadUserHomeImageDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    description: 'Được generate phía app khi màn hình mount (uuid)',
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

class UserHomeImageDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  filename: string;
}

export class CreateUserHomeDto {
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
  @IsNumber()
  @IsNotEmpty()
  userHomeProvince: number;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
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

  // @ApiProperty({
  //   example: YnEnum.N,
  //   enum: YnEnum,
  // })
  // @IsEnum(YnEnum)
  // @IsNotEmpty()
  // isMain: YnEnum;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;

  //   @ApiProperty({ type: UserHomeImageDto })
  //   @IsNotEmpty()
  //   @ValidateNested()
  //   @Type(() => UserHomeImageDto) // phải có
  //   userHomeImage: UserHomeImageDto;
}

// RESPONSE
export class ResUserHomeImageDto {
  @ApiProperty({ example: '' })
  filename: string;
}
export class ResUserHomeDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  userHomeCode: string;

  @ApiProperty({ example: '' })
  userHomeName: string;

  @ApiProperty({ example: '' })
  userHomeAddress: string;

  @ApiProperty({ example: '' })
  userHomeProvince: string;

  @ApiProperty({ example: '' })
  userHomeDescription: string;

  @ApiProperty({ example: '' })
  userHomeImage: string;

  @ApiProperty({ example: YnEnum.N })
  isIntegateTempHum: YnEnum;

  @ApiProperty({ example: YnEnum.N })
  isIntegateCurrent: YnEnum;

  @ApiProperty({ example: YnEnum.N })
  isTriggered: YnEnum;

  @ApiProperty({ example: YnEnum.N })
  isMain: YnEnum;
}
