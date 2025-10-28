import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/interfaces/dto';
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
    const count = await this.answerAdminRepository.getCountAnswer(dto);
    const list = await this.answerAdminRepository.getAll(dto);
    return { count, list };
  }
  async getDetail(answerCode: string): Promise<IAnswer | null> {
    const result = await this.answerAdminRepository.getDetail(answerCode);
    return result;
  }
  async createAnswer(body: CreateAnswerDto): Promise<number> {
    const result = await this.answerAdminRepository.createAnswer(body);
    return result;
  }
  async updateAnswer(body: UpdateAnswerDto): Promise<number> {
    const questions = await this.questionAdminService.getAllByAnswer(
      body.answerCode,
    );
    // set answerCode is 'null' If any questions are assigning this answer ( when change "category" || "object" )
    if (
      questions.length > 0 &&
      body.categoryAnsCode !== questions[0].categoryQuesCode
    ) {
      for (const ques of questions) {
        await this.questionAdminService.updateAnswerQuestionNull(
          ques.questionCode,
        );
      }
    }
    const result = await this.answerAdminRepository.updateAnswer(body);
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
