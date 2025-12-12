import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { YnEnum } from 'src/interfaces/admin.interface';

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
    example: 'N',
    enum: YnEnum,
  })
  @IsNotEmpty()
  @IsEnum(YnEnum)
  isSendAll: YnEnum;
}
