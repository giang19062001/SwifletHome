import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
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
  
  @ApiProperty({ example: 25.75, description: 'Chiều dài nhà (m)' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  userHomeLength: number;

  @ApiProperty({ example: 120.5, description: 'Chiều rộng nhà (m)' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  userHomeWidth: number;

  @ApiProperty({ example: 3, description: 'Số tầng' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userHomeFloor: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;
}

export class UserHomeAreaResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    userHomeCode: string;
    @ApiProperty({ example: '' })
    userCode: string;
    @ApiProperty({ example: 0 })
    userHomeLength: number;
    @ApiProperty({ example: 0 })
    userHomeWidth: number;
    @ApiProperty({ example: 0 })
    userHomeFloor: number;
}

export class UserHomeResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    userHomeCode: string;
    @ApiProperty({ example: '' })
    userCode: string;
    @ApiProperty({ example: '' })
    userName!: string;
    @ApiProperty({ example: '' })
    userPhone!: string;
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
    @ApiProperty({ example: 0 })
    userHomeLength: number;
    @ApiProperty({ example: 0 })
    userHomeWidth: number;
    @ApiProperty({ example: 0 })
    userHomeFloor: number;
    @ApiProperty({ example: '' })
    uniqueId: string;
    @ApiProperty({ example: YnEnum.N })
    isIntegateTempHum: YnEnum;
    @ApiProperty({ example: YnEnum.N })
    isIntegateCurrent: YnEnum;
    @ApiProperty({ example: YnEnum.N })
    isTriggered: YnEnum;
    @ApiProperty({ example: YnEnum.N })
    isActive: YnEnum;
    @ApiProperty({ example: new Date() })
    createdAt: Date;
    @ApiProperty({ example: new Date() })
    updatedAt: Date;
    @ApiProperty({ example: '' })
    createdId: string;
    @ApiProperty({ example: '' })
    updatedId: string;
}

export class UserHomeImageStrResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    filename: string;
}

export class UserHomeImageFileResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: 0 })
    userHomeSeq: number;
    @ApiProperty({ example: '' })
    userCode: string;
    @ApiProperty({ example: '' })
    uniqueId: string;
    @ApiProperty({ example: '' })
    filename: string;
    @ApiProperty({ example: '' })
    originalname: string;
    @ApiProperty({ example: 0 })
    size: number;
    @ApiProperty({ example: '' })
    mimetype: string;
    @ApiProperty({ example: YnEnum.N })
    isActive: YnEnum;
}
