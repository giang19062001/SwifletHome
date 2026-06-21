import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { ScreenResDto } from '../screen.response';
import { UpdateScreenDto } from './screen.dto';
import { ScreenAdminRepository } from './screen.repository';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ScreenAdminService {
  constructor(private readonly screenAdminRepository: ScreenAdminRepository) {}
  async getAll(dto: PagingDto): Promise<{ total: number; list: ScreenResDto[] }> {
    const total = await this.screenAdminRepository.getTotal();
    const list = await this.screenAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(screenKeyword: string): Promise<ScreenResDto | null> {
    const result = await this.screenAdminRepository.getDetail(screenKeyword);
    return result ?? null;
  }

  async update(dto: UpdateScreenDto, updatedId: string, screenKeyword: string): Promise<number> {
    const result = await this.screenAdminRepository.update(dto, updatedId, screenKeyword);
    return result;
  }

  async updateBanner(screenKeyword: string, bannerUrl: string, adminId: string): Promise<number> {
    // Xóa file cũ nếu có
    const detail = await this.getDetail(screenKeyword);
    if (detail && detail.contentCenter) {
      let center = detail.contentCenter;
      if (typeof center === 'string') {
        try {
          center = JSON.parse(center);
        } catch (e) {}
      }
      if (center?.banner) {
        const oldPath = path.join(process.cwd(), 'public', center.banner);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (e) {}
        }
      }
    }

    const result = await this.screenAdminRepository.updateBanner(screenKeyword, bannerUrl, adminId);
    return result;
  }
  // xử lí video cho screen dùng kiểu BANNER_VIDEOS_TEXT
  private async getTableVideo(screenKeyword: string): Promise<string> {
    const detail = await this.getDetail(screenKeyword);
    if (!detail || !detail.screenSupportContent) {
      throw new Error('Screen does not support dynamic videos');
    }

    let supportContent = detail.screenSupportContent;
    if (typeof supportContent === 'string') {
      try {
        supportContent = JSON.parse(supportContent);
      } catch (e) {
        supportContent = {};
      }
    }

    const tableVideo = supportContent?.tables?.video;
    if (!tableVideo) {
      throw new Error('No tableVideo configured for this screen');
    }

    return tableVideo;
  }

  async getAllVideos(screenKeyword: string): Promise<any[]> {
    const tableVideo = await this.getTableVideo(screenKeyword);
    return this.screenAdminRepository.getAllVideos(tableVideo);
  }

  async createVideo(screenKeyword: string, dto: any, createdId: string): Promise<number> {
    const tableVideo = await this.getTableVideo(screenKeyword);
    return this.screenAdminRepository.createVideo(tableVideo, dto, createdId);
  }

  async updateVideo(screenKeyword: string, seq: number, dto: any, updatedId: string): Promise<number> {
    const tableVideo = await this.getTableVideo(screenKeyword);
    return this.screenAdminRepository.updateVideo(tableVideo, seq, dto, updatedId);
  }

  async deleteVideo(screenKeyword: string, seq: number, updatedId: string): Promise<number> {
    const tableVideo = await this.getTableVideo(screenKeyword);
    return this.screenAdminRepository.deleteVideo(tableVideo, seq, updatedId);
  }

  async updateVideoSortOrder(screenKeyword: string, items: any[], updatedId: string): Promise<number> {
    const tableVideo = await this.getTableVideo(screenKeyword);
    return this.screenAdminRepository.updateVideoSortOrder(tableVideo, items, updatedId);
  }
}
