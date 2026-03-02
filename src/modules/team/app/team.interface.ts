import { YnEnum } from "src/interfaces/admin.interface";


export interface ITeamReviewFileStr {
  seq: number;
  filename: string;
}
export interface ITeamReviewFile {
  seq: number;
  reviewSeq: number;
  teamCode: string;
  homeName: string;
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  uniqueId: string;
  isActive: YnEnum;
}
