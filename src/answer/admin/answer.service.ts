import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/common/interface/dto';
import { IList } from 'src/common/interface/common';
import { AnswerAdminRepository } from './answer.repository';
import { IAnswer } from '../answer.interface';
import { GetAllAnswerDto, UpdateAnswerDto } from './answer.dto';

@Injectable()
export class AnswerAdminService {
  constructor(private readonly answerRepository: AnswerAdminRepository) {}
  async getAll(dto: GetAllAnswerDto): Promise<IList<IAnswer>> {
    const count = await this.answerRepository.getCountAnswer(dto);
    const list = await this.answerRepository.getAll(dto);
    return { count, list };
  }
  async getDetail(answerCode: string): Promise<IAnswer | null> {
    const result = await this.answerRepository.getDetail(answerCode);
    return result;
  }
  async updateAnswer(body: UpdateAnswerDto): Promise<number> {
    const result = await this.answerRepository.updateAnswer(body);
    return result;
  }
}
