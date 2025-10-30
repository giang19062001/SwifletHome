import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';
import { AnswerAdminRepository } from './answer.repository';
import { IAnswer } from '../answer.interface';
import {
  CreateAnswerDto,
  GetAllAnswerDto,
  UpdateAnswerDto,
} from './answer.dto';
import { QuestionAdminService } from 'src/modules/question/admin/question.service';

@Injectable()
export class AnswerAdminService {
  constructor(
    private readonly answerAdminRepository: AnswerAdminRepository,
    private readonly questionAdminService: QuestionAdminService,
  ) {}
  async getAll(dto: GetAllAnswerDto): Promise<IList<IAnswer>> {
    const total = await this.answerAdminRepository.getTotal(dto);
    const list = await this.answerAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(answerCode: string): Promise<IAnswer | null> {
    const result = await this.answerAdminRepository.getDetail(answerCode);
    return result;
  }
  async createAnswer(dto: CreateAnswerDto): Promise<number> {
    const result = await this.answerAdminRepository.createAnswer(dto);
    return result;
  }
  async updateAnswer(dto: UpdateAnswerDto, answerCode: string): Promise<number> {
    const questions = await this.questionAdminService.getAllByAnswer(
      answerCode,
    );
    // set answerCode is 'null' If any questions are assigning this answer ( when change "category" || "object" )
    if (
      questions.length > 0 &&
      dto.categoryAnsCode !== questions[0].categoryQuesCode
    ) {
      for (const ques of questions) {
        await this.questionAdminService.updateAnswerQuestionNull(
          ques.questionCode,
        );
      }
    }
    const result = await this.answerAdminRepository.updateAnswer(dto, answerCode);
    return result;
  }
  async deleteAnswer(answerCode: string): Promise<number> {
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
    const result = await this.answerAdminRepository.deleteAnswer(answerCode);
    return result;
  }
}
