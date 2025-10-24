import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/common/interface/dto';
import { IList } from 'src/common/interface/common';
import { IQuestion } from '../question.interface';
import { QuestionRepository } from './question.repository';
import { UpdateQuestionDto } from './question.dto';

@Injectable()
export class QuestionService {
  constructor(private readonly questionRepository: QuestionRepository) {}
  async getAll(dto: PagingDto): Promise<IList<IQuestion>> {
    const count = await this.questionRepository.getCountQuestion();
    const list = await this.questionRepository.getAll(dto);
    return { count, list };
  }
  async getDetail(questionCode: string): Promise<IQuestion | null> {
    const result = await this.questionRepository.getDetail(questionCode);
    return result;
  }
   async updateQuestion(dto: UpdateQuestionDto): Promise<number> {
    const result = await this.questionRepository.updateQuestion(dto);
    return result;
  }
}
