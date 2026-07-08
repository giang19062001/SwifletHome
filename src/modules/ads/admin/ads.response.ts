export class AdsBannerAdminResDto {
  seq: number;
  uniqueId: string;
  title: string;
  bannerUrl: string;
  bannerType: string;
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
export class AdsFileNotUseAdminResDto {
  seq: number;
  adsSeq: number;
  uniqueId: string;
  filename: string;
  mimetype: string;
}
