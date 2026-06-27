import { ApiProperty } from '@nestjs/swagger';

export class AdsBannerResDto {
  seq: number;
  uniqueId: string;
  title: string;
  bannerUrl: string;
  position: string;
  displayOrder: number;
  startTime: Date;
  endTime: Date;
  targetScreen: string;
  actionType: string;
  actionValue: string;
  isActive: string;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}
