import { Injectable } from '@nestjs/common';
import { CodeRepository } from './code.repository';
import { GetCodeDto } from './code.dto';
import { ICode } from './code.interface';
import { AbAdminService } from 'src/abstract/admin.abstract';

@Injectable()
export class CodeService extends AbAdminService {
  constructor(private readonly codeRepository: CodeRepository) {
    super();
  }
  async getAll(dto: GetCodeDto): Promise<ICode[]> {
    const list = await this.codeRepository.getAll(dto);
    return list;
  }

  getDetail(dto: string | number): Promise<any | null> {
    throw new Error('Method not implemented.');
  }
  create(dto: any): Promise<number> {
    throw new Error('Method not implemented.');
  }
  update(dto: any, id: string | number): Promise<number> {
    throw new Error('Method not implemented.');
  }
  delete(dto: string | number): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
