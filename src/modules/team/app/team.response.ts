import { ApiProperty, OmitType } from '@nestjs/swagger';
import { YnEnum } from 'src/interfaces/admin.interface';

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
  teamAddres: string;

  @ApiProperty({ example: '0' })
  provinceCode: string;

  @ApiProperty({ example: 5.0 })
  star: number;

  @ApiProperty({ example: '' })
  teamDescription: string;

  @ApiProperty({
    type: Object,
    nullable: true,
    example: {
      floor: {text: "Sàn", value:"ABC"},
      root: {text: "Mái", value:"ABC"},
      light: {text: "Đèn", value:"ABC"},
      nest: {text: "Lam", value:"ABC"},
    },
  })
  teamDescriptionSpecial: Record<string, any> | null;

  @ApiProperty({
    type: () => TeamImgResDto,
    isArray: true,
  })
  teamImages: TeamImgResDto[];
}

export class GetAllTeamResDto extends OmitType(GetDetailTeamResDto, ['teamDescription', 'teamDescriptionSpecial', 'teamImages'] as const) {}


export class GetReviewListOfTeamResDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: 'Good' })
  review: string

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