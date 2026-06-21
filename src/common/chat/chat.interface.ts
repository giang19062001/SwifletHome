export interface IChatItem {
  answerCode: string;
  questions: string[];
  answer?: { isFree: string; answerContent: string };
}
