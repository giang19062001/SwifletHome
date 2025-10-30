import { UploadService } from './../../upload/upload.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';
import { IHome, IHomeImg } from '../home.interface';
import { HomeAdminRepository } from './home.repository';
import { CreateHomeDto, UpdateHomeDto } from './home.dto';
import { diffByTwoArr } from 'src/helpers/func';

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
      let homeImages = await this.homeAdminRepository.getImages(
        result ? result?.seq : 0,
      );
      // remove main img
      let homeImagesExceptMain: IHomeImg[] = [];
      for (const img of homeImages) {
        if (img.filename == result.homeImage) {
          result.homeImage = img;
        } else {
          homeImagesExceptMain.push(img);
        }
      }
      result.homeImages = homeImagesExceptMain;
      return result;
    } else {
      return null;
    }
  }
  async createHome(dto: CreateHomeDto): Promise<number> {
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

  async updateHome(dto: UpdateHomeDto, homeCode: string): Promise<number> {
    console.log('dto', dto, homeCode);

    const home = await this.getDetail(homeCode);
    console.log('home', home);

    if (home) {
      // homeImage is changed -> delete old file
      if (dto.homeImage.filename !== (home.homeImage as IHomeImg).filename) {
        // delete old physical file
        const homeImagePath = `/${dto.source}/${(home.homeImage as IHomeImg).filename}`;
        await this.uploadService.deletePhysicalFile(homeImagePath);

        // delete old db file
        await this.homeAdminRepository.deleteHomeImagesOne(
          (home.homeImage as IHomeImg).seq,
        );

        //insert new homeImage
        await this.homeAdminRepository.createImages(
          home.seq,
          dto.source,
          'admin',
          dto.homeImage,
        );
      }

      const fileNeedDeletes: IHomeImg[] = diffByTwoArr(
        dto.homeImages,
        home.homeImages,
        'filename',
      );
      console.log('fileNeedDeletes -->', fileNeedDeletes);

      const fileNeedCreates: IHomeImg[] = diffByTwoArr(
        home.homeImages,
        dto.homeImages,
        'filename',
      );
      console.log('fileNeedCreates -->', fileNeedCreates);

      // homeImages is changed -> delete old file
      if (fileNeedDeletes.length) {
        // delete db
        await this.homeAdminRepository.deleteHomeImagesMulti(
          fileNeedDeletes.map((ele) => ele.seq),
        );
        // delete physical
        for (const file of fileNeedDeletes) {
          const filepath = `/${dto.source}/${file.filename}`;
          await this.uploadService.deletePhysicalFile(filepath);
        }
      }
      if (fileNeedCreates.length) {
        for (const file of fileNeedCreates) {
          await this.homeAdminRepository.createImages(
            home.seq,
            dto.source,
            'admin',
            file,
          );
        }
      }
      const result = await this.homeAdminRepository.updateHome(dto, homeCode);
      return result;
    } else {
      return 0;
    }
  }
  async deleteHome(homeCode: string): Promise<number> {
    const home = await this.homeAdminRepository.getDetail(homeCode);
    if (home) {
      const images = await this.homeAdminRepository.getImages(home?.seq ?? 0);

      const resultHome = await this.homeAdminRepository.deleteHome(homeCode);

      if (resultHome) {
        await this.homeAdminRepository.deleteHomeImages(home?.seq ?? 0);
      }
      const homeImagePath = `/home/${home.homeImage}`;
      await this.uploadService.deletePhysicalFile(homeImagePath);
      if (images.length) {
        // delete physical
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
