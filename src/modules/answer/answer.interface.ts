export interface IAnswer {
  seq: number;
  answerCode: string;
  answerObject: string;
  answerContent: string;
  answerCategory: string;
  isActive: 'Y' | 'N';
  isFree: string;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}
