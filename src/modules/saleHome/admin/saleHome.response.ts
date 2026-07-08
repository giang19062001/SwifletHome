import { HomeInfoDetailDto, HostInfoDetailDto, PolicyInfoDetailDto, TourInfoDetailDto } from '../app/saleHome.response';
import { NestInfoDto } from '../app/saleHome.dto';

export class SaleHomeFileItemAdminResDto {
  seq: number;
  homeCode: string;
  uniqueId: string;
  fileTypeCode: string;
  fileUrl: string;
  originalname: string;
  mimetype: string;
  size: number;
  isActive: string;
  createdAt: Date;
}
export class SaleHomeOptionAdminResDto {
  seq: number;
  homeCode: string;
  optionCode: string;
}
export class GetAllSaleHomeAdminResDto {
  homeCode: string;
  homeName: string;
  homeLocation: string;
  status: string;
  userCode: string;
  hostName: string;
  hostPhone: string;
  createdAt: Date;
  homeImage: string;
}
export class GetDetailSaleHomeAdminResDto {
  homeCode: string;
  status: string;
  uniqueId: string;
  userCode: string;
  hostInfo: HostInfoDetailDto;
  homeInfo: HomeInfoDetailDto;
  nestInfo: NestInfoDto;
  tourInfo: TourInfoDetailDto;
  policyInfo: PolicyInfoDetailDto;
  files: SaleHomeFileItemAdminResDto[];
}
export class SaleHomeSightSeeingAdminResDto {
  seq: number;
  homeCode: string;
  userCode: string;
  userName: string;
  userPhone: string;
  numberAttend: string;
  status: string;
  note: string;
  cancelReason: string;
  createdId: string;
  updatedId: string;
}
