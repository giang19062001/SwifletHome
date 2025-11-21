import { YnEnum } from "src/interfaces/admin.interface";

export interface IQuestion {
  seq: number;
  questionCode: string;
  questionContent: string;
  questionObject: string;
  questionCategory: string;
  isActive: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
  answerCode: string;
  categoryQuesName?: string;
  answerContent?: string
}
