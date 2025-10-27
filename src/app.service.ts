import { Injectable } from '@nestjs/common';
import { AnswerAdminService } from './answer/admin/answer.service';
import { IAnswer } from './answer/answer.interface';
import { CateQuestionService } from './cateQuestion/cateQuestion.service';
import { ICategoryQuestion } from './cateQuestion/cateQuestion.interface';

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
  async getAllCateQues(): Promise<ICategoryQuestion[]> {
    const result = await this.cateQuestionService.getAll({ limit: 0, page: 0 });
    return result.list;
  }
}
