import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/common/interface/dto';
import { IList } from 'src/common/interface/common';
import { QuestionAppRepository } from './question.repository';
import { IQuestion } from '../question.interface';

@Injectable()
export class QuestionAppService {
  constructor(private readonly questionRepository: QuestionAppRepository) {}
  async getQuestionReplied(): Promise<IQuestion[]> {
    const result = await this.questionRepository.getQuestionReplied();
    return result;
  }
}
