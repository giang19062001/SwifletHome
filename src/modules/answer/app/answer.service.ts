import { Injectable } from '@nestjs/common';
import { AnswerAppRepository } from './answer.repository';
import { IAnswer } from '../answer.interface';
import { QuestionAppService } from 'src/modules/question/app/question.service';
import { IQuestion } from 'src/modules/question/question.interface';
import { LoggingService } from 'src/common/logger/logger.service';
import { SearchService } from 'src/common/search/search.service';
@Injectable()
export class AnswerAppService {
  private readonly SERVICE_NAME = 'AnswerAppService';

  constructor(
    private readonly answerAppRepository: AnswerAppRepository,
    private readonly questionAppService: QuestionAppService,
    private readonly searchService: SearchService,

    private readonly logger: LoggingService,
  ) {}

  async reply(question: string, userCode: string): Promise<string> {
    const logbase = `${this.SERVICE_NAME}/reply`;
    this.logger.log(logbase, `Câu hỏi(${question})`);

    // get question
    const questions: IQuestion[] = await this.questionAppService.getQuestionReplied();

    let answers: IAnswer[] = [];

    if (questions.length) {
      for (const ques of questions) {
        // get answer
        const answer = await this.answerAppRepository.getAnswerReply(ques.answerCode);
        if (answer) {
          answers.push(answer);
        }
      }
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
        questions: questionContents,
        answer: answerMap.get(answerCode),
      };
    });

    // gọi search service
    const result = await this.searchService.reply(question, userCode, answerMapQuestionsResult);
    return result;
  }
}
