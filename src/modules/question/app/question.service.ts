import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/interfaces/dto';
import { IList } from 'src/interfaces/common';
import { QuestionAppRepository } from './question.repository';
import { IQuestion } from '../question.interface';

@Injectable()
export class QuestionAppService {
  constructor(private readonly questionAppRepository: QuestionAppRepository) {}
  async getQuestionReplied(): Promise<IQuestion[]> {
    const result = await this.questionAppRepository.getQuestionReplied();
    return result;
  }
}
