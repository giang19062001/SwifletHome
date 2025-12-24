import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { YnEnum } from 'src/interfaces/admin.interface';

export enum SentTypeEnum {
  PROVINCE = 'PROVINCE',
  USER = 'USER',
  ALL = 'ALL',
}
export class PushNotifycationByAdminDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    example: [],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  userCodesMuticast: string[];

  @ApiProperty({
    example: [],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  provinceCodesMuticast: string[];

  @ApiProperty({
    example: 'N',
    enum: SentTypeEnum,
  })
  @IsNotEmpty()
  @IsEnum(SentTypeEnum)
  sendType: SentTypeEnum;
}
