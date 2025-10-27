import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/common/interface/dto';
import { IList } from 'src/common/interface/common';
import { AnswerAdminRepository } from './answer.repository';
import { IAnswer } from '../answer.interface';
import {
  CreateAnswerDto,
  GetAllAnswerDto,
  UpdateAnswerDto,
} from './answer.dto';
import { QuestionAdminService } from 'src/question/admin/question.service';

@Injectable()
export class AnswerAdminService {
  constructor(
    private readonly answerRepository: AnswerAdminRepository,
    private readonly questionAdminService: QuestionAdminService,
  ) {}
  async getAll(dto: GetAllAnswerDto): Promise<IList<IAnswer>> {
    const count = await this.answerRepository.getCountAnswer(dto);
    const list = await this.answerRepository.getAll(dto);
    return { count, list };
  }
  async getDetail(answerCode: string): Promise<IAnswer | null> {
    const result = await this.answerRepository.getDetail(answerCode);
    return result;
  }
  async createAnswer(body: CreateAnswerDto): Promise<number> {
    const result = await this.answerRepository.createAnswer(body);
    return result;
  }
  async updateAnswer(body: UpdateAnswerDto): Promise<number> {
    const questions = await this.questionAdminService.getAllByAnswer(body.answerCode);
    // set answerCode is 'null' If any questions are assigning this answer
    if(questions.length > 0 && body.categoryAnsCode !== questions[0].categoryQuesCode){
      for (const ques of questions) {
        await this.questionAdminService.updateAnswerQuestionNull(ques.questionCode)
      }
    }
    console.log("questions", questions);
    console.log("body.categoryAnsCode", body.categoryAnsCode)
    const result = await this.answerRepository.updateAnswer(body);
    return result;
  }
}
