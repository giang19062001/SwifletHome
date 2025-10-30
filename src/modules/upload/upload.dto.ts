import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum UploadFileSrouceEnum {
  ANSWER = 'answer',
  BLOG = 'blog',
  HOME = 'home',
}
export class UploadVideoLinkDto {
   @ApiProperty({
    example: 'https://www.youtube.com/watch?v=6KJrNWC0tfw&list=RDQGa6FL98h-c&index=2',
  })
  @IsString()
  @IsNotEmpty()
  urlLink: string;

  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  createdId: string;
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
