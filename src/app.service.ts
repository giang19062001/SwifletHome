import { Injectable } from '@nestjs/common';
import { AnswerAdminService } from './modules/answer/admin/answer.service';
import { IAnswer } from './modules/answer/answer.interface';
import { CateQuestionService } from './modules/cateQuestion/cateQuestion.service';
import { ICategoryQuestion } from './modules/cateQuestion/cateQuestion.interface';

@Injectable()
export class AppService {
  constructor(
    private readonly answerService: AnswerAdminService,
    private readonly cateQuestionService: CateQuestionService,
  ) {}
  async getDetailAnswer(answerCode: string): Promise<IAnswer | null> {
    const result = await this.answerService.getDetail(answerCode);
    return result;
  }
  async renderCreateAnswer(): Promise<any> {
    const { list } = await this.cateQuestionService.getAll({
      limit: 0,
      page: 0,
    });
    return {
      answerContent: '',
      answerContentRaw: '',
      answerObject: '',
      categoryAnsCode: '',
      categoryQuestion: list,
    };
  }
  async renderAnswerUpdate(answerCode: string): Promise<any> {
    const answer = await this.answerService.getDetail(answerCode);
    const { list } = await this.cateQuestionService.getAll({
      limit: 0,
      page: 0,
    });
    return {
      answerContent: answer?.answerContent,
      answerContentRaw: answer?.answerContentRaw,
      answerObject: answer?.answerObject,
      categoryAnsCode: answer?.categoryAnsCode,
      categoryQuestion: list,
    };
  }
}
