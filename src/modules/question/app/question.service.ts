import { Injectable } from '@nestjs/common';
import { QuestionAppResDto } from './question.response';
import { QuestionAppRepository } from './question.repository';

@Injectable()
export class QuestionAppService {
  constructor(private readonly questionAppRepository: QuestionAppRepository) {}
  async getQuestionReplied(): Promise<QuestionAppResDto[]> {
    const result = await this.questionAppRepository.getQuestionReplied();
    return result;
  }
}
