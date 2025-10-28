import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum UploadFileSrouceEnum {
  ANSWER = 'answer',
  BLOG = 'blog',
  HOME = 'home',
}
export class UploadFileDto {
  @ApiProperty({
    example: 'answer',
    enum: UploadFileSrouceEnum,
  })
  @IsEnum(UploadFileSrouceEnum)
  source: UploadFileSrouceEnum;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  file: any;
}
