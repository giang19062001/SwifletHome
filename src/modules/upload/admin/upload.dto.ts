import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MediaBadgeEnum } from '../upload.interface';
import { YnEnum } from 'src/interfaces/admin.interface';

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

  @ApiProperty({
    example: MediaBadgeEnum.NORMAL,
    enum: MediaBadgeEnum,
    nullable: true,
    required: false,
  })
  @IsEnum(MediaBadgeEnum)
  badge: MediaBadgeEnum;
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

  @ApiProperty({
    example: MediaBadgeEnum.NORMAL,
    enum: MediaBadgeEnum,
    nullable: true,
    required: false,
  })
  @IsEnum(MediaBadgeEnum)
  badge: MediaBadgeEnum;

  @ApiProperty({
    example: YnEnum.Y,
    enum: YnEnum,
    nullable: true,
    required: false,
  })
  @IsEnum(YnEnum)
  isCoupleFree: YnEnum;
}
