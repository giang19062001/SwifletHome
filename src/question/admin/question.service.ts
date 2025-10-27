import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/common/interface/dto';
import { IList } from 'src/common/interface/common';
import { IQuestion } from '../question.interface';
import { QuestionAdminRepository } from './question.repository';
import { CreateQuestionDto, UpdateQuestionDto } from './question.dto';

@Injectable()
export class QuestionAdminService {
  constructor(private readonly questionRepository: QuestionAdminRepository) {}
  async getAll(dto: PagingDto): Promise<IList<IQuestion>> {
    const count = await this.questionRepository.getCountQuestion();
    const list = await this.questionRepository.getAll(dto);
    return { count, list };
  }
  async getAllByAnswer(answerCode: string): Promise<IQuestion[]> {
    const result = await this.questionRepository.getAllByAnswer(answerCode);
    return result;
  }
  async getDetail(questionCode: string): Promise<IQuestion | null> {
    const result = await this.questionRepository.getDetail(questionCode);
    return result;
  }
  async createQuestion(dto: CreateQuestionDto): Promise<number> {
    const result = await this.questionRepository.createQuestion(dto);
    return result;
  }
  async updateQuestion(dto: UpdateQuestionDto): Promise<number> {
    const result = await this.questionRepository.updateQuestion(dto);
    return result;
  }
  async updateAnswerQuestionNull(questionCode: string): Promise<number> {
    const result =
      await this.questionRepository.updateAnswerQuestionNull(questionCode);
    return result;
  }
  async deleteQuestion(questionCode: string): Promise<number> {
    const result = await this.questionRepository.deleteQuestion(questionCode);
    return result;
  }
}
