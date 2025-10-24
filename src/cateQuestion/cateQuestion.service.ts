import { Injectable } from '@nestjs/common';
import { CateQuestionRepository } from './cateQuestion.repository';
import { ICategoryQuestion } from './cateQuestion.interface';
import { PagingDto } from 'src/common/interface/dto';
import { IList } from 'src/common/interface/common';

@Injectable()
export class CateQuestionService {
  constructor(
    private readonly cateQuestionRepository: CateQuestionRepository,
  ) {}
  async getAll(
    dto: PagingDto,
  ): Promise<IList<ICategoryQuestion>> {
    const count = await this.cateQuestionRepository.getCountCategoryQuestion();
    const list = await this.cateQuestionRepository.getAll(dto);
    return { count, list };
  }
}
