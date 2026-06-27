import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { AdsBannerResDto } from '../ads.response';
import { CreateAdsBannerDto, UpdateAdsBannerDto } from './ads.dto';
import { AdsAdminRepository } from './ads.repository';
import { getFileLocation } from 'src/config/multer.config';

@Injectable()
export class AdsAdminService {
  constructor(private readonly adsAdminRepository: AdsAdminRepository) {}
  async getAll(dto: PagingDto): Promise<{ total: number; list: AdsBannerResDto[] }> {
    const total = await this.adsAdminRepository.getTotal();
    const list = await this.adsAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(seq: number): Promise<AdsBannerResDto | null> {
    const result = await this.adsAdminRepository.getDetail(seq);
    return result;
  }
  async create(dto: CreateAdsBannerDto, createdId: string): Promise<number> {
    const result = await this.adsAdminRepository.create(dto, createdId);
    if (result > 0 && dto.uuid) {
      await this.adsAdminRepository.updateSeqFilesByUniqueId(result, dto.uuid, createdId);
    }
    return result;
  }
  async update(dto: UpdateAdsBannerDto, updatedId: string, seq: number): Promise<number> {
    const result = await this.adsAdminRepository.update(dto, updatedId, seq);
    if (result > 0 && dto.uuid) {
      await this.adsAdminRepository.markOldFilesAsInactive(seq, dto.uuid, updatedId);
      await this.adsAdminRepository.updateSeqFilesByUniqueId(seq, dto.uuid, updatedId);
    }
    return result;
  }
  async delete(seq: number): Promise<number> {
    const result = await this.adsAdminRepository.delete(seq);
    return result;
  }

  // --- Files Methods ---
  async uploadAdsFile(uniqueId: string, file: Express.Multer.File, createdId: string): Promise<{ url: string }> {
    const location = getFileLocation(file.mimetype, file.fieldname);
    const url = `${location}/${file.filename}`;
    await this.adsAdminRepository.insertFile(uniqueId, url, file.originalname, file.size, file.mimetype, createdId);
    return { url };
  }

  async getFilesNotUse(): Promise<any[]> {
    return await this.adsAdminRepository.getFilesNotUse();
  }

  async deleteFile(seq: number): Promise<number> {
    return await this.adsAdminRepository.deleteFile(seq);
  }
}
