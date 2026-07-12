import { ApiProperty } from '@nestjs/swagger';
import { TeamStatusEnum, YnEnum } from 'src/interfaces/admin.interface';

export class TeamFileTypeAdminResDto {
  seq?: number;
  fileTypeCode: string;
  fileTypeText: string;
  isActive?: string;
}
export class TeamServiceTypeAdminResDto {
  seq: number;
  userTypeCode: string;
  serviceTypeCode: string;
  serviceTypeName: string;
}
export class TeamImgBaseAdminResDto {
  seq: number;
  teamSeq?: number;
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  isActive: string;
  fileTypeCode?: string;
  uniqueId?: string;
}
export class TeamServiceBaseAdminResDto {
  seq: number;
  seqTeam: number;
  uniqueId: string;
  userTypeCode: string;
  serviceTypeCode: string;
  serviceTextInput: string;
}
export class TeamServiceFileBaseAdminResDto {
  seq: number;
  seqService: number;
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  isActive: string;
  uniqueId?: string;
}
export class TeamFileNotUseAdminResDto {
  seq: number;
  filename: string;
}

export class TeamResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  userName!: string;

  @ApiProperty({ example: '' })
  userTypeCode: string;

  @ApiProperty({ example: '' })
  teamCode: string;

  @ApiProperty({ example: '' })
  teamName: string;

  @ApiProperty({ example: '' })
  teamUserName!: string;

  @ApiProperty({ example: '' })
  teamPhone: string;

  @ApiProperty({ example: '' })
  teamAddress: string;

  @ApiProperty({ example: '' })
  teamDescription: string;

  @ApiProperty({ example: '' })
  teamDescriptionSpecial: Record<string, any> | null;

  @ApiProperty({ example: ['79', '82'] })
  provinceCodes: any;

  @ApiProperty({ example: '' })
  provinceName!: string;

  @ApiProperty({ example: YnEnum.N })
  isActive: YnEnum;

  @ApiProperty({ example: TeamStatusEnum.WAITING, enum: TeamStatusEnum })
  status: TeamStatusEnum;

  @ApiProperty({ example: YnEnum.N, enum: YnEnum })
  isSeleted: YnEnum;

  @ApiProperty({ example: new Date() })
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: '' })
  createdId: string;

  @ApiProperty({ example: '' })
  updatedId: string;

  @ApiProperty({ example: '' })
  teamImage: string | TeamImgResDto;

  @ApiProperty({ example: '' })
  teamFiles: TeamImgResDto[];

  @ApiProperty({ example: '' })
  userTypeKeyWord: string;

  @ApiProperty({ example: '' })
  userTypeName: string;
}

export class TeamReviewResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  review: string;

  @ApiProperty({ example: 0 })
  star: number;

  @ApiProperty({ example: '' })
  reviewBy: string;

  @ApiProperty({ example: '' })
  reviewByName!: string;

  @ApiProperty({ example: '' })
  teamName: string;

  @ApiProperty({ example: '' })
  ownerName!: string;

  @ApiProperty({ example: new Date() })
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: YnEnum.N })
  isDisplay: YnEnum;

  @ApiProperty({ example: '' })
  reviewImages: TeamReviewFileResDto[];
}

export class TeamReviewFileResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: 0 })
  reviewSeq: number;

  @ApiProperty({ example: '' })
  filename: string;

  @ApiProperty({ example: '' })
  originalname: string;

  @ApiProperty({ example: 0 })
  size: number;

  @ApiProperty({ example: '' })
  mimetype: string;

  @ApiProperty({ example: YnEnum.N })
  isActive: YnEnum;
}

export class TeamImgResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: 0 })
  teamSeq: number;

  @ApiProperty({ example: '' })
  filename: string;

  @ApiProperty({ example: '' })
  originalname: string;

  @ApiProperty({ example: 0 })
  size: number;

  @ApiProperty({ example: '' })
  mimetype: string;

  @ApiProperty({ example: YnEnum.N })
  isActive: YnEnum;
}
