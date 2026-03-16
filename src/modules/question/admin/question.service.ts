import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { QuestionResDto } from "../question.response";
import { CreateQuestionDto, UpdateQuestionDto } from './question.dto';
import { QuestionAdminRepository } from './question.repository';

@Injectable()
export class QuestionAdminService {
  constructor(private readonly questionAdminRepository: QuestionAdminRepository) {
  }
  async getAll(dto: PagingDto): Promise<{ total: number; list: QuestionResDto[] }> {
    const total = await this.questionAdminRepository.getTotal();
    const list = await this.questionAdminRepository.getAll(dto);
    return { total, list };
  }
  async getAllByAnswer(answerCode: string): Promise<QuestionResDto[]> {
    const result = await this.questionAdminRepository.getAllByAnswer(answerCode);
    return result;
  }
  async getDetail(questionCode: string): Promise<QuestionResDto | null> {
    const result = await this.questionAdminRepository.getDetail(questionCode);
    return result;
  }
  async create(dto: CreateQuestionDto, createdId: string): Promise<number> {
    const result = await this.questionAdminRepository.create(dto, createdId);
    return result;
  }
  async update(dto: UpdateQuestionDto, updatedId: string, questionCode: string): Promise<number> {
    const result = await this.questionAdminRepository.update(dto, updatedId, questionCode);
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
