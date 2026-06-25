import { ApiProperty } from '@nestjs/swagger';

export class AdsBannerResDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: 'Banner Title' })
  title: string;

  @ApiProperty({ example: 'https://example.com/banner.jpg' })
  bannerUrl: string;

  @ApiProperty({ example: 'BOTTOM' })
  position: string;

  @ApiProperty({ example: 1 })
  displayOrder: number;

  @ApiProperty({ example: '2023-01-01 00:00:00' })
  startTime: string;

  @ApiProperty({ example: '2023-12-31 23:59:59' })
  endTime: string;

  @ApiProperty({ example: 'QR_SCREEN' })
  targetScreen: string;

  @ApiProperty({ example: 'OPEN_URL' })
  actionType: string;

  @ApiProperty({ example: 'https://example.com' })
  actionValue: string;
}
