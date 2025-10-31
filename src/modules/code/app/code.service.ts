import { Injectable } from '@nestjs/common';
import { CodeAppRepository } from './code.repository';
import { ICode } from '../code.interface';
import { GetAllCodeDto } from './code.dto';


@Injectable()
export class CodeAppService {
  constructor(private readonly codeAppRepository: CodeAppRepository) {}
  async getAll(dto: GetAllCodeDto): Promise<ICode[]> {
    const list = await this.codeAppRepository.getAll(dto);
    return list
  }
  
}
