import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum UploadIsFeeEnum {
  Y = 'Y',
  N = 'N',
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

export class UploadImgFileDto {
  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  createdId: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  answerImage: any;
}

export class UploadAudioFilesDto {
  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  createdId: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  answerAudioFree: any;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  answerAudioPay: any;
}
