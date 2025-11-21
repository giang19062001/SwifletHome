import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { IQuestion } from '../question.interface';
import { QuestionAdminRepository } from './question.repository';
import { CreateQuestionDto, UpdateQuestionDto } from './question.dto';
import { AbAdminService } from 'src/abstract/admin.abstract';

@Injectable()
export class QuestionAdminService extends AbAdminService {
  constructor(private readonly questionAdminRepository: QuestionAdminRepository) {
    super();
  }
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
  async create(dto: CreateQuestionDto): Promise<number> {
    const result = await this.questionAdminRepository.create(dto);
    return result;
  }
  async update(dto: UpdateQuestionDto, questionCode: string): Promise<number> {
    const result = await this.questionAdminRepository.update(dto, questionCode);
    return result;
  }
  async delete(questionCode: string): Promise<number> {
    const result = await this.questionAdminRepository.delete(questionCode);
    return result;
  }
  async updateAnswerQuestionNull(questionCode: string): Promise<number> {
    const result = await this.questionAdminRepository.updateAnswerQuestionNull(questionCode);
    return result;
  }
}
