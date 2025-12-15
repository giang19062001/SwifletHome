import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UploadVideoLinkDto {
  @ApiProperty({
    example: 'https://www.youtube.com/watch?v=...',
  })
  @IsString()
  @IsNotEmpty()
  urlLink: string;
}

export class UploadMediaVideoLinkDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  originalname: string;

  @ApiProperty({
    example: 'https://www.youtube.com/watch?v=...',
  })
  @IsString()
  @IsNotEmpty()
  urlLink: string;
}

export class UploadImgFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  editorImg: any;
}

export class UploadAudioFilesDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  editorAudioFree: any;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  editorAudioPay: any;
}

export class UploadMediaAudioFilesDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  mediaAudioFree: any;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  mediaAudioPay: any;
}
