import { Injectable } from '@nestjs/common';
import { CateQuestionRepository } from './cateQuestion.repository';
import { ICategoryQuestion } from './cateQuestion.interface';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';

@Injectable()
export class CateQuestionService {
  constructor(
    private readonly cateQuestionRepository: CateQuestionRepository,
  ) {}
  async getAll(
    dto: PagingDto,
  ): Promise<IList<ICategoryQuestion>> {
    const total = await this.cateQuestionRepository.getTotal();
    const list = await this.cateQuestionRepository.getAll(dto);
    return { total, list };
  }
}
