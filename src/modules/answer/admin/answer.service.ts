import { Injectable } from '@nestjs/common';
import { AnswerAdminRepository } from './answer.repository';
import { CreateAnswerDto, GetAllAnswerDto, UpdateAnswerDto } from './answer.dto';
import { QuestionAdminService } from 'src/modules/question/admin/question.service';
import { ListResponseDto } from "src/dto/common.dto";
import { AnswerResDto } from "../answer.response";

@Injectable()
export class AnswerAdminService {
  constructor(
    private readonly answerAdminRepository: AnswerAdminRepository,
    private readonly questionAdminService: QuestionAdminService,
  ) {}
  async getAll(dto: GetAllAnswerDto): Promise<{ total: number; list: AnswerResDto[] }> {
    const total = await this.answerAdminRepository.getTotal(dto);
    const list = await this.answerAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(answerCode: string): Promise<AnswerResDto | null> {
    const result = await this.answerAdminRepository.getDetail(answerCode);
    return result;
  }
  async create(dto: CreateAnswerDto, createdId: string): Promise<number> {
    const result = await this.answerAdminRepository.create(dto, createdId);
    return result;
  }
  async update(dto: UpdateAnswerDto, updatedId: string, answerCode: string): Promise<number> {
    const questions = await this.questionAdminService.getAllByAnswer(answerCode);
    // set answerCode is 'null' If any questions are assigning this answer ( when change "category" || "object" )
    if (questions.length > 0 && dto.answerCategory !== questions[0].questionCategory) {
      for (const ques of questions) {
        await this.questionAdminService.updateAnswerQuestionNull(ques.questionCode);
      }
    }
    const result = await this.answerAdminRepository.update(dto, updatedId, answerCode);
    return result;
  }
  async delete(answerCode: string): Promise<number> {
    const questions = await this.questionAdminService.getAllByAnswer(answerCode);
    // set answerCode is 'null' If any questions are assigning this answer
    if (questions.length > 0) {
      for (const ques of questions) {
        await this.questionAdminService.updateAnswerQuestionNull(ques.questionCode);
      }
    }
    const result = await this.answerAdminRepository.delete(answerCode);
    return result;
  }
}
