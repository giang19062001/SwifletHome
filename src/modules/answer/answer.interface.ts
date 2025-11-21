import { YnEnum } from "src/interfaces/admin.interface";

export interface IAnswer {
  seq: number;
  answerCode: string;
  answerObject: string;
  answerContent: string;
  answerCategory: string;
  isActive: YnEnum;
  isFree: string;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}
