import { Injectable } from '@nestjs/common';
import { AnswerAdminService } from './modules/answer/admin/answer.service';
import { IAnswer } from './modules/answer/answer.interface';
import { CateQuestionService } from './modules/cateQuestion/cateQuestion.service';
import { HomeAdminService } from './modules/home/admin/home.service';

@Injectable()
export class AppService {
  constructor(
    private readonly answerAdminService: AnswerAdminService,
    private readonly cateQuestionService: CateQuestionService,
    private readonly homeAdminService: HomeAdminService,
  ) {}
  async getDetailAnswer(answerCode: string): Promise<IAnswer | null> {
    const result = await this.answerAdminService.getDetail(answerCode);
    return result;
  }
  async renderCreateAnswer(): Promise<any> {
    const { list } = await this.cateQuestionService.getAll({
      limit: 0,
      page: 0,
    });
    return {
      answerContentRaw: '',
      answerObject: '',
      categoryAnsCode: '',
      categoryQuestion: list,
    };
  }
  async renderAnswerUpdate(answerCode: string): Promise<any> {
    const answer = await this.answerAdminService.getDetail(answerCode);
    const { list } = await this.cateQuestionService.getAll({
      limit: 0,
      page: 0,
    });
    return {
      answerContentRaw: answer?.answerContentRaw,
      answerObject: answer?.answerObject,
      categoryAnsCode: answer?.categoryAnsCode,
      categoryQuestion: list,
    };
  }
  async renderHomeUpdate(answerCode: string): Promise<any> {
    const homeData = await this.homeAdminService.getDetail(answerCode);
    return {
      homeData: homeData
    };
  }
}
