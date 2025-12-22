import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { PackageAdminRepository } from './package.repository';
import { IPackage } from '../package.interface';
import { formatPrice } from 'src/helpers/func.helper';

@Injectable()
export class PackageAdminService {
  constructor(private readonly packageAdminRepository: PackageAdminRepository) {}
  async getAll(dto: PagingDto): Promise<IList<IPackage>> {
    const total = await this.packageAdminRepository.getTotal();
    const list = await this.packageAdminRepository.getAll(dto);

    const listHandle = list.map((item) => ({
      ...item,
      packagePrice: formatPrice(item.packagePrice), // chuyên sang tiền việt
    }));

    return { total, list: listHandle };
  }
  async getDetail(packageCode: string): Promise<IPackage | null> {
    const result = await this.packageAdminRepository.getDetail(packageCode);
    return result;
  }
}
