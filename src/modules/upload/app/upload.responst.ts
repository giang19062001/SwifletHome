import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ example: 'Y' })
  isFree: string;

  @ApiProperty({ example: 'N' })
  isCanBeDownload: string;
}
