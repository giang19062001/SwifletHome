import { YnEnum } from 'src/interfaces/admin.interface';

export interface ITeam {
  seq: number;
  userCode: string;
  userName?: string;
  userTypeCode: string;
  teamCode: string;
  teamName: string;
  teamAddress: string;
  teamDescription: string;
  teamDescriptionSpecial: Record<string, any> | null;
  provinceCode: string;
  provinceName?: string;
  isActive: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
  teamImage: string | ITeamImg;
  teamImages: ITeamImg[];
  userTypeKeyWord: string;
  userTypeName: string
}

export interface ITeamReview {
  seq: number;
  review: string;
  star: number;
  reviewBy: string;
  reviewByName?: string;
  teamName: string;
  ownerName?: string;
  createdAt: Date;
  updatedAt: Date;
  isDisplay: YnEnum;
  reviewImages: ITeamReviewFile[];
}
export interface ITeamReviewFile {
  seq: number;
  reviewSeq: number;
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  isActive: YnEnum;
}

export interface ITeamImg {
  seq: number;
  teamSeq: number;
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  isActive: YnEnum;
}
