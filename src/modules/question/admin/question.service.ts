import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';
import { IQuestion } from '../question.interface';
import { QuestionAdminRepository } from './question.repository';
import { CreateQuestionDto, UpdateQuestionDto } from './question.dto';

@Injectable()
export class QuestionAdminService {
  constructor(private readonly questionAdminRepository: QuestionAdminRepository) {}
  async getAll(dto: PagingDto): Promise<IList<IQuestion>> {
    const total = await this.questionAdminRepository.getTotal();
    const list = await this.questionAdminRepository.getAll(dto);
    return { total, list };
  }
  async getAllByAnswer(answerCode: string): Promise<IQuestion[]> {
    const result = await this.questionAdminRepository.getAllByAnswer(answerCode);
    return result;
  }
  async getDetail(questionCode: string): Promise<IQuestion | null> {
    const result = await this.questionAdminRepository.getDetail(questionCode);
    return result;
  }
  async createQuestion(dto: CreateQuestionDto): Promise<number> {
    const result = await this.questionAdminRepository.createQuestion(dto);
    return result;
  }
  async updateQuestion(dto: UpdateQuestionDto): Promise<number> {
    const result = await this.questionAdminRepository.updateQuestion(dto);
    return result;
  }
  async updateAnswerQuestionNull(questionCode: string): Promise<number> {
    const result =
      await this.questionAdminRepository.updateAnswerQuestionNull(questionCode);
    return result;
  }
  async deleteQuestion(questionCode: string): Promise<number> {
    const result = await this.questionAdminRepository.deleteQuestion(questionCode);
    return result;
  }
}
