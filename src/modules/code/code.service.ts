import { Injectable } from '@nestjs/common';
import { CodeRepository } from './code.repository';
import { GetAllCodeDto } from './code.dto';
import { ICode } from './code.interface';


@Injectable()
export class CodeService {
  constructor(private readonly codeRepository: CodeRepository) {}
  async getAll(dto: GetAllCodeDto): Promise<ICode[]> {
    const list = await this.codeRepository.getAll(dto);
    return list
  }
  
}
