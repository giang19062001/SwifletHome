import { NestInfoDto } from './saleHome.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { HomeInfoDto, HostInfoDto, PolicyInfoDto, TourInfoDto } from './saleHome.dto';

export class OptionSimpleDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  valueOption: string;
}

export class SaleHomeOptionItemResDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  keyOption: string;

  @ApiProperty()
  valueOption: string;
}

export class SaleHomeFileTypeItemResDto {
  @ApiProperty()
  fileTypeCode: string;

  @ApiProperty()
  fileTypeText: string;
}

export class GetInitFormMutationResDto {
  @ApiProperty({ example: 'uuid', format: 'uuid' })
  uniqueId: string;

  @ApiProperty({ type: [SaleHomeOptionItemResDto] })
  hostRole: SaleHomeOptionItemResDto[];

  @ApiProperty({ type: [SaleHomeOptionItemResDto] })
  homeModel: SaleHomeOptionItemResDto[];

  @ApiProperty({ type: [SaleHomeOptionItemResDto] })
  topicsShare: SaleHomeOptionItemResDto[];

  @ApiProperty({ type: [SaleHomeOptionItemResDto] })
  sightseeingAreas: SaleHomeOptionItemResDto[];

  @ApiProperty({ type: [SaleHomeOptionItemResDto] })
  includedServices: SaleHomeOptionItemResDto[];

  @ApiProperty({ type: [SaleHomeOptionItemResDto] })
  availableDays: SaleHomeOptionItemResDto[];

  @ApiProperty({ type: [SaleHomeOptionItemResDto] })
  commitments: SaleHomeOptionItemResDto[];

  @ApiProperty({ type: [SaleHomeFileTypeItemResDto] })
  fileTypes: SaleHomeFileTypeItemResDto[];
}

export class UploadSaleHomeFileResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  url: string;

  @ApiProperty({ example: '' })
  mimetype: string;
}

export class GetAllSaleHomeResDto {
  @ApiProperty({ example: '' })
  homeImage: string;

  @ApiProperty({ example: 'HOM000001' })
  homeCode: string;

  @ApiProperty({ example: 'Nhà Yến A' })
  homeName: string;

  @ApiProperty({ example: 'AEON Tạ Quang Bửu' })
  homeLocation: string;

  @ApiProperty({ example: 'US000001' })
  userCode: string;
}

export class SaleHomeListResDto {
  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ type: [GetAllSaleHomeResDto] })
  list: GetAllSaleHomeResDto[];
}

export class GetAllSaleHomeWrapperResDto {
  @ApiProperty({ type: SaleHomeListResDto })
  myHomes: SaleHomeListResDto;

  @ApiProperty({ type: SaleHomeListResDto })
  otherHomes: SaleHomeListResDto;
}

export class HostInfoDetailDto extends OmitType(HostInfoDto, ['hostRole'] as const) {
  @ApiProperty({ type: OptionSimpleDto })
  hostRole: OptionSimpleDto;
}

export class HomeInfoDetailDto extends OmitType(HomeInfoDto, ['homeModel'] as const) {
  @ApiProperty({ type: OptionSimpleDto })
  homeModel: OptionSimpleDto;

  @ApiProperty({ example: 10.762622 })
  latitude: number;

  @ApiProperty({ example: 106.660172 })
  longitude: number;
}

export class TourInfoDetailDto extends OmitType(TourInfoDto, ['topicsShare', 'sightseeingAreas', 'includedServices'] as const) {
  @ApiProperty({ type: [OptionSimpleDto] })
  topicsShare: OptionSimpleDto[];

  @ApiProperty({ type: [OptionSimpleDto] })
  sightseeingAreas: OptionSimpleDto[];

  @ApiProperty({ type: [OptionSimpleDto] })
  includedServices: OptionSimpleDto[];
}

export class PolicyInfoDetailDto extends OmitType(PolicyInfoDto, ['availableDays', 'commitments'] as const) {
  @ApiProperty({ type: [OptionSimpleDto] })
  availableDays: OptionSimpleDto[];

  @ApiProperty({ type: [OptionSimpleDto] })
  commitments: OptionSimpleDto[];
}

export class SaleHomeFileItemAppResDto {
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
export class GetDetailSaleHomeResDto {
  @ApiProperty({ example: 'HOM000001' })
  homeCode: string;

  @ApiProperty({ example: 'WAITING' })
  status: string;

  @ApiProperty({ example: 'uuid', format: 'uuid' })
  uniqueId: string;

  @ApiProperty({ type: HostInfoDetailDto })
  hostInfo: HostInfoDetailDto;

  @ApiProperty({ type: HomeInfoDetailDto })
  homeInfo: HomeInfoDetailDto;

  @ApiProperty({ type: NestInfoDto })
  nestInfo: NestInfoDto;

  @ApiProperty({ type: TourInfoDetailDto })
  tourInfo: TourInfoDetailDto;

  @ApiProperty({ type: PolicyInfoDetailDto })
  policyInfo: PolicyInfoDetailDto;

  @ApiProperty({ type: [SaleHomeFileItemAppResDto] })
  files: SaleHomeFileItemAppResDto[];
}

export class SaleHomeOptionAppResDto {
  seq: number;
  homeCode: string;
  optionCode: string;
}
export class GetAllSaleHomeAppResDto {
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
export class GetDetailSaleHomeAppResDto {
  homeCode: string;
  status: string;
  uniqueId: string;
  userCode: string;
  hostInfo: HostInfoDetailDto;
  homeInfo: HomeInfoDetailDto;
  nestInfo: NestInfoDto;
  tourInfo: TourInfoDetailDto;
  policyInfo: PolicyInfoDetailDto;
  files: SaleHomeFileItemAppResDto[];
}
export class SaleHomeSightSeeingAppResDto {
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
