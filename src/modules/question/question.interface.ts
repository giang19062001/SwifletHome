export interface IQuestion {
  seq: number;
  questionCode: string;
  questionContent: string;
  questionObject: string;
  questionCategory: string;
  isActive: string;
  createdAt: string;
  updatedAt: string;
  createdId: string;
  updatedId: string;
  answerCode: string;
  categoryQuesName?: string;
  answerContent?: string
}
