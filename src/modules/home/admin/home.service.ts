import { UploadService } from './../../upload/upload.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin';
import { IList } from 'src/interfaces/admin';
import { IHome, IHomeImg } from '../home.interface';
import { HomeAdminRepository } from './home.repository';
import { CreateHomeDto, UpdateHomeDto } from './home.dto';
import { diffByTwoArr } from 'src/helpers/func';
import { LoggingService } from 'src/common/logger/logger.service';
import { AbAdminService } from 'src/abstract/admin.service';

@Injectable()
export class HomeAdminService extends AbAdminService{
  private readonly SERVICE_NAME = "HomeAdminService"
  constructor(
    private readonly homeAdminRepository: HomeAdminRepository,
    private readonly uploadService: UploadService,
    private readonly logger: LoggingService,
  ) {
    super();
  }
  async getAll(dto: PagingDto): Promise<IList<IHome>> {
    const total = await this.homeAdminRepository.getTotal();
    const list = await this.homeAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(homeCode: string): Promise<IHome | null> {
    let result = await this.homeAdminRepository.getDetail(homeCode);
    if (result) {
      let homeImages = await this.homeAdminRepository.getImages(result ? result?.seq : 0);
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
      if (dto.homeImage.filename !== (home.homeImage as IHomeImg).filename) {
        // delete old physical file
        const homeImagePath = `/images/homes/${(home.homeImage as IHomeImg).filename}`;
        await this.uploadService.deleteLocalFile(homeImagePath);

        // delete old db file
        await this.homeAdminRepository.deleteHomeImagesOne((home.homeImage as IHomeImg).seq);

        //insert new homeImage
        await this.homeAdminRepository.createImages(home.seq, 'admin', dto.homeImage);
      }

      const fileNeedDeletes: IHomeImg[] = diffByTwoArr(dto.homeImages, home.homeImages, 'filename');
      this.logger.log(logbase, `fileNeedDeletes --> ${JSON.stringify(fileNeedDeletes)}`);

      const fileNeedCreates: IHomeImg[] = diffByTwoArr(home.homeImages, dto.homeImages, 'filename');
      this.logger.log(logbase, `fileNeedCreates --> ${JSON.stringify(fileNeedCreates)}`);

      // homeImages is changed -> delete old file
      if (fileNeedDeletes.length) {
        // delete db
        await this.homeAdminRepository.deleteHomeImagesMulti(fileNeedDeletes.map((ele) => ele.seq));
        // delete physical
        for (const file of fileNeedDeletes) {
          const filepath = `/images/homes/${file.filename}`;
          await this.uploadService.deleteLocalFile(filepath);
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
      // await this.uploadService.deleteLocalFile(homeImagePath);
      // if (images.length) {
      // xóa các file ảnh của nhà yến trong thư mục uploads
      //   for (const file of images) {
      //     const filepath = `/images/homes/${file.filename}`;
      //     await this.uploadService.deleteLocalFile(filepath);
      //   }
      // }

      return resultHome;
    } else {
      return 0;
    }
  }
}
