import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { formatPrice } from 'src/helpers/func.helper';
import { PackageResDto } from "../package.response";
import { UpdatePackageDto } from './package.dto';
import { PackageAdminRepository } from './package.repository';

@Injectable()
export class PackageAdminService {
  constructor(private readonly packageAdminRepository: PackageAdminRepository) {}
  async getAll(dto: PagingDto): Promise<{ total: number; list: PackageResDto[] }> {
    const total = await this.packageAdminRepository.getTotal();
    const list = await this.packageAdminRepository.getAll(dto);

    const listHandle = list.map((item) => ({
      ...item,
      packagePrice: formatPrice(item.packagePrice), // chuyên sang tiền việt
    }));

    return { total, list: listHandle };
  }
  async getDetail(packageCode: string): Promise<PackageResDto | null> {
    const result = await this.packageAdminRepository.getDetail(packageCode);
    return result ? { ...result, packagePrice: formatPrice(result.packagePrice) } : null;
  }

  async update(dto: UpdatePackageDto, updatedId: string, packageCode: string): Promise<number> {
    const result = await this.packageAdminRepository.update(dto, updatedId, packageCode);
    return result;
  }
}
