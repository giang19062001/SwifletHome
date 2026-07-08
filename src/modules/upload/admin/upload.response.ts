import { ApiProperty } from '@nestjs/swagger';
import { YnEnum } from 'src/interfaces/admin.interface';
import { MediaBadgeEnum } from '../common/upload.enum';

export class FileUploadAdminResDto {
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
export class AudioFreePayAdminResDto {
  @ApiProperty({ example: '' })
  filenameFree: string;

  @ApiProperty({ example: '' })
  mimetypeFree: string;

  @ApiProperty({ example: '' })
  filenamePay: string;

  @ApiProperty({ example: '' })
  mimetypePay: string;
}
export class FileMediaAdminResDto {
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
