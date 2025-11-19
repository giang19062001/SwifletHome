import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin';
import { IList } from 'src/interfaces/admin';
import { AbAdminService } from 'src/abstract/admin.service';
import { PackageAdminRepository } from './package.repository';
import { IPackage } from '../package.interface';

@Injectable()
export class PackageAdminService extends AbAdminService {
  constructor(private readonly packageAdminRepository: PackageAdminRepository) {
    super();
  }
  async getAll(dto: PagingDto): Promise<IList<IPackage>> {
    const total = await this.packageAdminRepository.getTotal();
    const list = await this.packageAdminRepository.getAll(dto);
    return { total, list };
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
