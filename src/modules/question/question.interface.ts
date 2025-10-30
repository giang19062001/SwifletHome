export interface IQuestion {
  seq: number;
  questionCode: string;
  questionContent: string;
  questionObject: string;
  categoryQuesCode: string;
  isActive: string;
  createdAt: string;
  updatedAt: string;
  createdId: string;
  updatedId: string;
  answerCode: string;
  categoryQuesName?: string;
  answerContentRaw?: string
}
