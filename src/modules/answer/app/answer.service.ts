import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { ChatService } from 'src/common/chat/chat.service';
import { QuestionAppService } from 'src/modules/question/app/question.service';
import { QuestionResDto } from "../../question/question.response";
import { AnswerResDto } from "../answer.response";
import { AnswerAppRepository } from './answer.repository';

@Injectable()
export class AnswerAppService {
  private readonly SERVICE_NAME = 'AnswerAppService';

  constructor(
    private readonly answerAppRepository: AnswerAppRepository,
    private readonly questionAppService: QuestionAppService,
    private readonly chatService: ChatService,
    private readonly logger: LoggingService,
  ) { }

  async reply(question: string, userCode: string): Promise<string> {
    const questions: QuestionResDto[] = await this.questionAppService.getQuestionReplied();
    let answers: AnswerResDto[] = [];

    if (questions.length) {
      const answerCodes = [...new Set(questions.map((q) => q.answerCode).filter(Boolean))];
      answers = await this.answerAppRepository.getAnswersByCodes(answerCodes);
    }

    const questionMap = new Map<string, string[]>();
    const answerMap = new Map<string, { isFree: string; answerContent: string }>();

    questions.forEach((ques) => {
      if (!questionMap.has(ques.answerCode)) {
        questionMap.set(ques.answerCode, []);
      }
      questionMap.get(ques.answerCode)!.push(ques.questionContent);
    });

    answers.forEach((answer) => {
      const answerCode = (answer as any).answerCode;
      if (answerCode && !answerMap.has(answerCode)) {
        answerMap.set(answerCode, {
          isFree: answer.isFree,
          answerContent: answer.answerContent,
        });
      }
    });

    const answerMapQuestionsResult = Array.from(questionMap.entries()).map(([answerCode, questionContents]) => {
      return {
        answerCode,
        questions: questionContents,
        answer: answerMap.get(answerCode),
      };
    });

    return await this.chatService.reply(question, userCode, answerMapQuestionsResult, questions);
  }
}
