import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID, Matches, ValidateNested } from 'class-validator';
import { MsgDto } from 'src/helpers/message.helper';

export class UploadFilesAppDto {
  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;

  @ApiProperty({ example: 'FILE_OUTSIDE' })
  @IsOptional()
  @IsString()
  fileTypeCode?: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Tối đa 5 file (ảnh/video)',
  })
  saleHomeFiles: any[];
}

export class HostInfoDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty()
  hostName: string;

  @ApiProperty({ example: '0901234567' })
  @IsString()
  @IsNotEmpty()
  hostPhone: string;

  @ApiProperty({ example: 'zalo.me/0901234567' })
  @IsString()
  @IsOptional()
  socialContact?: string;

  @ApiProperty({ example: 'COD000035' })
  @IsString()
  @IsNotEmpty()
  hostRole: string;
}

export class HomeInfoDto {
  @ApiProperty({ example: 'Nhà Yến Sinh Thái 3FAM' })
  @IsString()
  @IsNotEmpty()
  homeName: string;

  @ApiProperty({ example: 'AEON Tạ Quang Bửu' })
  @IsString()
  @IsNotEmpty()
  homelocation: string;

  @ApiProperty({ example: '123 Đường X, Xã Y, Huyện Z, Tỉnh W' })
  @IsString()
  @IsNotEmpty()
  homeAddress: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @IsNotEmpty()
  homeAge: number;

  @ApiProperty({ example: 'COD000039' })
  @IsString()
  @IsNotEmpty()
  homeModel: string;

  @ApiProperty({ example: 10.762622, required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: 106.660172, required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}

export class NestInfoDto {
  @ApiProperty({ example: 150 })
  @IsNumber()
  @IsNotEmpty()
  currentNests: number;

  @ApiProperty({ example: 12.5 })
  @IsNumber()
  @IsNotEmpty()
  averageYieldKg: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @IsNotEmpty()
  numberOfFloors: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsNotEmpty()
  numberOfRooms: number;
}

export class TourInfoDto {
  @ApiProperty({ example: 'Nhà yến sinh thái bao quanh bởi vườn trái cây...' })
  @IsString()
  @IsNotEmpty()
  shortDescription: string;

  @ApiProperty({ example: ['COD000044', 'COD000045', 'COD000046'] })
  @IsArray()
  @IsNotEmpty()
  topicsShare: string[];

  @ApiProperty({ example: ['COD000051', 'COD000052'] })
  @IsArray()
  @IsNotEmpty()
  sightseeingAreas: string[];

  @ApiProperty({ example: ['COD000058', 'COD000059'] })
  @IsArray()
  @IsNotEmpty()
  includedServices: string[];

  @ApiProperty({ example: 'Khách vui lòng đặt trước đồ ăn trưa.' })
  @IsString()
  @IsOptional()
  serviceNotes?: string;

  @ApiProperty({ example: 'Thỏa thuận với app' })
  @IsString()
  @IsNotEmpty()
  tourFee: string;

  @ApiProperty({ example: 60 })
  @IsNumber()
  @IsNotEmpty()
  durationPerTourMinutes: number;
}

export class PolicyInfoDto {
  @ApiProperty({ example: ['COD000064', 'COD000065', 'COD000066'] })
  @IsArray()
  @IsNotEmpty()
  availableDays: string[];

  @ApiProperty({ example: '09:00 - 11:00, 14:00 - 16:00' })
  @IsString()
  @Matches(/^(\d{2}:\d{2}\s*-\s*\d{2}:\d{2})(,\s*\d{2}:\d{2}\s*-\s*\d{2}:\d{2})*$/, { message: MsgDto.InvalidTimeframesFormat })
  @IsNotEmpty()
  timeframes: string;

  @ApiProperty({ example: '1 ngày trước' })
  @IsString()
  @IsNotEmpty()
  timeNoticeRequired: string;

  @ApiProperty({ example: ['COD000072', 'COD000073', 'COD000074', 'COD000075'] })
  @IsArray()
  @IsNotEmpty()
  commitments: string[];
}

export class CreateSaleHomeAppDto {
  @ApiProperty({ type: HostInfoDto })
  @ValidateNested()
  @Type(() => HostInfoDto)
  @IsObject()
  hostInfo: HostInfoDto;

  @ApiProperty({ type: HomeInfoDto })
  @ValidateNested()
  @Type(() => HomeInfoDto)
  @IsObject()
  homeInfo: HomeInfoDto;

  @ApiProperty({ type: NestInfoDto })
  @ValidateNested()
  @Type(() => NestInfoDto)
  @IsObject()
  nestInfo: NestInfoDto;

  @ApiProperty({ type: TourInfoDto })
  @ValidateNested()
  @Type(() => TourInfoDto)
  @IsObject()
  tourInfo: TourInfoDto;

  @ApiProperty({ type: PolicyInfoDto })
  @ValidateNested()
  @Type(() => PolicyInfoDto)
  @IsObject()
  policyInfo: PolicyInfoDto;

  @ApiProperty({ example: 'uuid chính lấy từ /saleHome/getDetail', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;
}

export class UpdateSaleHomeAppDto extends OmitType(CreateSaleHomeAppDto, ['uniqueId'] as const) {}
