export interface IChatItem {
  questions: string[];
  answer?: { isFree: string; answerContent: string };
}

export interface IChatItemV2 {
  answerCode: string;
  questions: string[];
  answer?: { isFree: string; answerContent: string };
}

export interface IChatHistory {
  user: string;
  assistant: string; // answerCode
}