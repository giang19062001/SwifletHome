import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { QuestionAppRepository } from './question.repository';
import { ListResponseDto } from "src/dto/common.dto";
import { QuestionResDto } from "../question.response";

@Injectable()
export class QuestionAppService {
  constructor(private readonly questionAppRepository: QuestionAppRepository) {}
  async getQuestionReplied(): Promise<QuestionResDto[]> {
    const result = await this.questionAppRepository.getQuestionReplied();
    return result;
  }
}
