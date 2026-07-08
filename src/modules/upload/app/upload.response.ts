import { ApiProperty } from '@nestjs/swagger';
import { YnEnum } from 'src/interfaces/admin.interface';
import { MediaBadgeEnum } from '../upload.interface';

export class GetAllMediaResDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: '' })
  filename: string;

  @ApiProperty({ example: '' })
  originalname: string;

  @ApiProperty({ example: 0 })
  size: number;

  @ApiProperty({ example: '' })
  mimetype: string;

  @ApiProperty({ example: '2025-12-15 14:23:56' })
  createdAt: string;

  @ApiProperty({ example: '' })
  urlLink: string;

  // @ApiProperty({ example: 'Y' })
  // isFree: string;

  @ApiProperty({ example: MediaBadgeEnum.NORMAL })
  badge: MediaBadgeEnum;

  @ApiProperty({ example: 'N' })
  isCanBeDownload: string;
}
export class FileUploadAppResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  filename: string;

  @ApiProperty({ example: '' })
  filenamePay: string;

  @ApiProperty({ example: '' })
  originalname: string;

  @ApiProperty({ example: 0 })
  size: number;

  @ApiProperty({ example: '' })
  mimetype: string;

  @ApiProperty({ example: '' })
  urlLink: string;

  @ApiProperty({ example: new Date() })
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: '' })
  createdId: string;

  @ApiProperty({ example: '' })
  updatedId: string;
}
export class AudioFreePayAppResDto {
  @ApiProperty({ example: '' })
  filenameFree: string;

  @ApiProperty({ example: '' })
  mimetypeFree: string;

  @ApiProperty({ example: '' })
  filenamePay: string;

  @ApiProperty({ example: '' })
  mimetypePay: string;
}
export class FileMediaAppResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  filename: string;

  @ApiProperty({ example: '' })
  originalname: string;

  @ApiProperty({ example: 0 })
  size: number;

  @ApiProperty({ example: '' })
  mimetype: string;

  @ApiProperty({ example: '' })
  urlLink: string;

  @ApiProperty({ example: YnEnum.N })
  isFree!: YnEnum;

  @ApiProperty({ example: YnEnum.N })
  isCoupleFree!: YnEnum;

  @ApiProperty({ example: '' })
  badge: MediaBadgeEnum;

  @ApiProperty({ example: new Date() })
  createdAt: Date;
}
