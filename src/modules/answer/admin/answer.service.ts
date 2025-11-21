import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { AnswerAdminRepository } from './answer.repository';
import { IAnswer } from '../answer.interface';
import {
  CreateAnswerDto,
  GetAllAnswerDto,
  UpdateAnswerDto,
} from './answer.dto';
import { QuestionAdminService } from 'src/modules/question/admin/question.service';
import { AbAdminService } from 'src/abstract/admin.abstract';

@Injectable()
export class AnswerAdminService extends AbAdminService{
  constructor(
    private readonly answerAdminRepository: AnswerAdminRepository,
    private readonly questionAdminService: QuestionAdminService,
  ) {
    super();
  }
  async getAll(dto: GetAllAnswerDto): Promise<IList<IAnswer>> {
    const total = await this.answerAdminRepository.getTotal(dto);
    const list = await this.answerAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(answerCode: string): Promise<IAnswer | null> {
    const result = await this.answerAdminRepository.getDetail(answerCode);
    return result;
  }
  async create(dto: CreateAnswerDto): Promise<number> {
    const result = await this.answerAdminRepository.create(dto);
    return result;
  }
  async update(dto: UpdateAnswerDto, answerCode: string): Promise<number> {
    const questions = await this.questionAdminService.getAllByAnswer(
      answerCode,
    );
    // set answerCode is 'null' If any questions are assigning this answer ( when change "category" || "object" )
    if (
      questions.length > 0 &&
      dto.answerCategory !== questions[0].questionCategory
    ) {
      for (const ques of questions) {
        await this.questionAdminService.updateAnswerQuestionNull(
          ques.questionCode,
        );
      }
    }
    const result = await this.answerAdminRepository.update(dto, answerCode);
    return result;
  }
  async delete(answerCode: string): Promise<number> {
    const questions =
      await this.questionAdminService.getAllByAnswer(answerCode);
    // set answerCode is 'null' If any questions are assigning this answer
    if (questions.length > 0) {
      for (const ques of questions) {
        await this.questionAdminService.updateAnswerQuestionNull(
          ques.questionCode,
        );
      }
    }
    const result = await this.answerAdminRepository.delete(answerCode);
    return result;
  }
}
