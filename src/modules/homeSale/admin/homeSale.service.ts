import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin';
import { IList } from 'src/interfaces/admin';
import { IHomeSale, IHomeSaleImg } from '../homeSale.interface';
import { HomeSaleAdminRepository } from './homeSale.repository';
import { CreateHomeDto, UpdateHomeDto } from './homeSale.dto';
import { diffByTwoArr } from 'src/helpers/func';
import { LoggingService } from 'src/common/logger/logger.service';
import { AbAdminService } from 'src/abstract/admin.service';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';

@Injectable()
export class HomeSaleAdminService extends AbAdminService{
  private readonly SERVICE_NAME = "HomeSaleAdminService"
  constructor(
    private readonly homeAdminRepository: HomeSaleAdminRepository,
    private readonly fileLocalService: FileLocalService,
    private readonly logger: LoggingService,
  ) {
    super();
  }
  async getAll(dto: PagingDto): Promise<IList<IHomeSale>> {
    const total = await this.homeAdminRepository.getTotal();
    const list = await this.homeAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(homeCode: string): Promise<IHomeSale | null> {
    let result = await this.homeAdminRepository.getDetail(homeCode);
    if (result) {
      let homeImages = await this.homeAdminRepository.getImages(result ? result?.seq : 0);
      // remove main img
      let homeImagesExceptMain: IHomeSaleImg[] = [];
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
  async create(dto: CreateHomeDto): Promise<number> {
    const seq = await this.homeAdminRepository.create(dto);
    if (seq) {
      //homeImage
      if (dto.homeImage) {
        await this.homeAdminRepository.createImages(seq, dto.createdId, dto.homeImage);
      }
      //homeImages
      if (dto.homeImages.length > 0) {
        for (const file of dto.homeImages) {
          await this.homeAdminRepository.createImages(seq, dto.createdId, file);
        }
      }
    }
    return seq;
  }

  async update(dto: UpdateHomeDto, homeCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/update`;

    const home = await this.getDetail(homeCode);
    if (home) {
      // homeImage is changed -> delete old file
      if (dto.homeImage.filename !== (home.homeImage as IHomeSaleImg).filename) {
        // delete old physical file
        const homeImagePath = `/images/homes/${(home.homeImage as IHomeSaleImg).filename}`;
        await this.fileLocalService.deleteLocalFile(homeImagePath);

        // delete old db file
        await this.homeAdminRepository.deleteHomeImagesOne((home.homeImage as IHomeSaleImg).seq);

        //insert new homeImage
        await this.homeAdminRepository.createImages(home.seq, 'admin', dto.homeImage);
      }

      const fileNeedDeletes: IHomeSaleImg[] = diffByTwoArr(dto.homeImages, home.homeImages, 'filename');
      this.logger.log(logbase, `fileNeedDeletes --> ${JSON.stringify(fileNeedDeletes)}`);

      const fileNeedCreates: IHomeSaleImg[] = diffByTwoArr(home.homeImages, dto.homeImages, 'filename');
      this.logger.log(logbase, `fileNeedCreates --> ${JSON.stringify(fileNeedCreates)}`);

      // homeImages is changed -> delete old file
      if (fileNeedDeletes.length) {
        // delete db
        await this.homeAdminRepository.deleteHomeImagesMulti(fileNeedDeletes.map((ele) => ele.seq));
        // delete physical
        for (const file of fileNeedDeletes) {
          const filepath = `/images/homes/${file.filename}`;
          await this.fileLocalService.deleteLocalFile(filepath);
        }
      }
      if (fileNeedCreates.length) {
        for (const file of fileNeedCreates) {
          await this.homeAdminRepository.createImages(home.seq, 'admin', file);
        }
      }
      const result = await this.homeAdminRepository.update(dto, homeCode);
      return result;
    } else {
      return 0;
    }
  }
  async delete(homeCode: string): Promise<number> {
    const home = await this.homeAdminRepository.getDetail(homeCode);
    if (home) {
      // const images = await this.homeAdminRepository.getImages(home?.seq ?? 0);

      const resultHome = await this.homeAdminRepository.delete(homeCode);

      // xóa các file ảnh của nhà yến trong databse
      // if (resultHome) {
      //   await this.homeAdminRepository.deleteHomeImages(home?.seq ?? 0);
      // }
      // const homeImagePath = `/image/homes/${home.homeImage}`;
      // await this.fileLocalService.deleteLocalFile(homeImagePath);
      // if (images.length) {
      // xóa các file ảnh của nhà yến trong thư mục uploads
      //   for (const file of images) {
      //     const filepath = `/images/homes/${file.filename}`;
      //     await this.fileLocalService.deleteLocalFile(filepath);
      //   }
      // }

      return resultHome;
    } else {
      return 0;
    }
  }
}
