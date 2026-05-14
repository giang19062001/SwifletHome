import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { TeamStatusEnum } from 'src/interfaces/admin.interface';

export class TeamImgResDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: 'uploads/images/***/***.jpg' })
  filename: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimetype: string;

  @ApiProperty({ required: false, example: 800 })
  width?: number;

  @ApiProperty({ required: false, example: 600 })
  height?: number;
}

export class StructuredTeamFilesResDto {
  @ApiProperty({ example: 'FILE_TYPE_01' })
  fileTypeCode: string;

  @ApiProperty({ example: 'Giấy tờ pháp lý' })
  fileTypeText: string;

  @ApiProperty({ type: [TeamImgResDto] })
  images: TeamImgResDto[];
}

export class TeamServiceResDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: 'SERVICE_TYPE_01' })
  serviceTypeCode: string;

  @ApiProperty({ example: 'Tên dịch vụ' })
  serviceTypeText: string;

  @ApiProperty({ example: 'Mô tả dịch vụ' })
  serviceTextInput: string;

  @ApiProperty({ type: [TeamImgResDto] })
  images: TeamImgResDto[];
}

export class GetDetailTeamResDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  userTypeCode: string;

  @ApiProperty({ example: '' })
  userTypeKeyWord: string;

  @ApiProperty({ example: '' })
  userTypeName: string;

  @ApiProperty({ example: '' })
  teamCode: string;

  @ApiProperty({ example: '' })
  teamName: string;

  @ApiProperty({ example: '' })
  teamUserName: string;

  @ApiProperty({ example: '' })
  teamPhone: string;

  @ApiProperty({ example: '' })
  teamAddress: string;

  @ApiProperty({ example: ['79', '82', '96','91'] })
  provinceCodes: any;

  @ApiProperty({ example: 5.0 })
  star: number;

  @ApiProperty({ example: '' })
  teamDescription: string;

  @ApiProperty({
    type: Object,
    nullable: true,
    example: {
      monthlyVolumn: 0,
      minimunQuantity: 0,
    },
  })
  teamDescriptionSpecial: Record<string, number> | null;

  @ApiProperty({ example: TeamStatusEnum.WAITING, enum: TeamStatusEnum })
  status: TeamStatusEnum;

  @ApiProperty({ example: 'uploads/images/***/***.jpg' })
  teamImage: string;

  @ApiProperty({
    type: [StructuredTeamFilesResDto],
  })
  teamFiles: StructuredTeamFilesResDto[];

  @ApiProperty({
    type: [TeamServiceResDto],
  })
  services: TeamServiceResDto[];
}

export class GetAllTeamResDto extends OmitType(GetDetailTeamResDto, ['teamDescription', 'teamDescriptionSpecial', 'teamFiles'] as const) {}

export class GetReviewListOfTeamResDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: 'Good' })
  review: string;

  @ApiProperty({ example: 5 })
  star: number;

  @ApiProperty({ example: 'USR000001' })
  reviewBy: string;

  @ApiProperty({ example: 'Giang' })
  reviewByName: string;

  @ApiProperty({
    type: () => ReviewImgResDto,
    isArray: true,
  })
  reviewImages: ReviewImgResDto[];
}

export class ReviewImgResDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: 'uploads/images/***/***.jpg' })
  filename: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimetype: string;
}

export class UploadReviewFilesResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  filename: string;
}

export class UploadTeamFileResDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: 'uploads/images/***/***.jpg' })
  url: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimetype: string;
}

export class TeamFileTypeResDto {
  @ApiProperty({ example: 'FILE_TYPE_01' })
  fileTypeCode: string;

  @ApiProperty({ example: 'Giấy tờ pháp lý' })
  fileTypeText: string;
}

export class TeamServiceOptionResDto {
  @ApiProperty({ example: 'BUILD_RAW' })
  serviceTypeCode: string;

  @ApiProperty({ example: 'Xây dựng phần thô nhà yến' })
  serviceDescription: string;

  @ApiProperty({ example: 'uuid của service này' })
  uniqueId: string;
}

export class ProvinceResDto {
  @ApiProperty({ example: 'PRV001' })
  provinceCode: string;

  @ApiProperty({ example: 'Hà Nội' })
  provinceName: string;
}

export class InitFormCreateTeamAppResDto {
  @ApiProperty({ example: 'uuid-string' })
  uniqueId: string;

  @ApiProperty({ type: [TeamFileTypeResDto] })
  teamFileTypes: TeamFileTypeResDto[];

  @ApiProperty({ type: [TeamServiceOptionResDto] })
  services: TeamServiceOptionResDto[];

  @ApiProperty({ type: [ProvinceResDto] })
  provinces: ProvinceResDto[];
}

export class CheckAvailableTeamResDto {
  @ApiProperty({ example: 'TEA000001' })
  teamCode: string;

  @ApiProperty({ example: TeamStatusEnum.APPROVE, enum: TeamStatusEnum })
  status: TeamStatusEnum;
}
