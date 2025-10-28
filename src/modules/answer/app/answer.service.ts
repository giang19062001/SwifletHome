import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/interfaces/dto';
import { IList } from 'src/interfaces/common';
import { AnswerAppRepository } from './answer.repository';
import { IAnswer } from '../answer.interface';
import { QuestionAppService } from 'src/modules/question/app/question.service';
import { IQuestion } from 'src/modules/question/question.interface';

@Injectable()
export class AnswerAppService {
  constructor(
    private readonly answerAppRepository: AnswerAppRepository,
    private readonly questionAppService: QuestionAppService,
  ) {}

  async reply(): Promise<any[]> {
    // get question
    const questions: IQuestion[] =
      await this.questionAppService.getQuestionReplied();

    let answers: IAnswer[] = [];

    if (questions.length) {
      for (const ques of questions) {
        // get answer
        const answer = await this.answerAppRepository.getAnswerContent(
          ques.answerCode,
        );
        if (answer) {
          answers.push(answer);
        }
      }
    }

    const questionMap = new Map<string, string[]>();
    const answerMap = new Map<string, string>();

    questions.forEach((ques) => {
      if (!questionMap.has(ques.answerCode)) {
        questionMap.set(ques.answerCode, []);
      }
      questionMap.get(ques.answerCode)!.push(ques.questionContent);
    });

    answers.forEach((answer) => {
      const answerCode = (answer as any).answerCode;
      if (answerCode && !answerMap.has(answerCode)) {
        answerMap.set(answerCode, answer.answerContent);
      }
    });

    //  merged
    const mergedResults = Array.from(questionMap.entries()).map(
      ([answerCode, questionContents]) => {
        return {
          questions: questionContents,
          answer: answerMap.get(answerCode)
        };
      },
    );

    console.log(mergedResults)
    return mergedResults;
  }
}
