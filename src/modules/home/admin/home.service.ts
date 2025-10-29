import { UploadService } from './../../upload/upload.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';
import { IHome } from '../home.interface';
import { HomeAdminRepository } from './home.repository';
import { CreateHomeDto } from './home.dto';

@Injectable()
export class HomeAdminService {
  constructor(
    private readonly homeAdminRepository: HomeAdminRepository,
    private readonly uploadService: UploadService,
  ) {}
  async getAll(dto: PagingDto): Promise<IList<IHome>> {
    const total = await this.homeAdminRepository.getTotal();
    const list = await this.homeAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(homeCode: string): Promise<IHome | null> {
    let result = await this.homeAdminRepository.getDetail(homeCode);
    if (result) {
      result.homeImages = await this.homeAdminRepository.getImages(
        result ? result?.seq : 0,
      );
      return result;
    } else {
      return null;
    }
  }

  parseHomeImg(
    files: Express.Multer.File[],
  ): [Express.Multer.File | undefined, Express.Multer.File[]] {
    let homeImage: Express.Multer.File | undefined;
    const homeImages: Express.Multer.File[] = [];

    if (files && files.length > 0) {
      files.forEach((file) => {
        if (file.fieldname === 'homeImage') {
          homeImage = file;
        } else if (file.fieldname === 'homeImages') {
          homeImages.push(file);
        }
      });
    }
    return [homeImage, homeImages];
  }
  async createHome(dto: CreateHomeDto): Promise<number> {
    console.log(dto);
    const seq = await this.homeAdminRepository.createHome(dto);
    if (seq) {
      //homeImage
      if (dto.homeImage) {
        await this.homeAdminRepository.createImages(
          seq,
          dto.source,
          dto.createdId,
          dto.homeImage,
        );
      }
      //homeImages
      if (dto.homeImages.length > 0) {
        for (const file of dto.homeImages) {
          await this.homeAdminRepository.createImages(
            seq,
            dto.source,
            dto.createdId,
            file,
          );
        }
      }
    }
    return seq;
  }

  async deleteHome(homeCode: string): Promise<number> {
    const home = await this.homeAdminRepository.getDetail(homeCode);
    console.log("home  ==>'", home);
    if (home) {
      const images = await this.homeAdminRepository.getImages(home?.seq ?? 0);

      const resultHome = await this.homeAdminRepository.deleteHome(homeCode);

      if (resultHome) {
        await this.homeAdminRepository.deleteHomeImages(home?.seq ?? 0);
      }
      const homeImagePath = `/home/${home.homeImage}`;
      await this.uploadService.deletePhysicalFile(homeImagePath);
      if (images.length) {
        for (const file of images) {
          const filepath = `/home/${file.filename}`;
          await this.uploadService.deletePhysicalFile(filepath);
        }
      }

      return resultHome;
    } else {
      return 0;
    }
  }
}
