export interface IQuestion {
  seq: number;
  questionCode: string;
  questionContent: string;
  questionObject: string;
  questionCategory: string;
  isActive: 'Y' | 'N';
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
  answerCode: string;
  categoryQuesName?: string;
  answerContent?: string
}
