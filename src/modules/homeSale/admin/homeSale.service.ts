import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { IHomeSale, IHomeSaleImg, IHomeSaleSubmit } from '../homeSale.interface';
import { HomeSaleAdminRepository } from './homeSale.repository';
import { CreateHomeDto, UpdateHomeDto, UpdateStatusDto } from './homeSale.dto';
import { diffByTwoArr } from 'src/helpers/func.helper';
import { LoggingService } from 'src/common/logger/logger.service';
import { AbAdminService } from 'src/abstract/admin.abstract';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';

@Injectable()
export class HomeSaleAdminService extends AbAdminService {
  private readonly SERVICE_NAME = 'HomeSaleAdminService';
  constructor(
    private readonly homSaleAdminRepository: HomeSaleAdminRepository,
    private readonly fileLocalService: FileLocalService,
    private readonly logger: LoggingService,
  ) {
    super();
  }
  async getAll(dto: PagingDto): Promise<IList<IHomeSale>> {
    const total = await this.homSaleAdminRepository.getTotal();
    const list = await this.homSaleAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(homeCode: string): Promise<IHomeSale | null> {
    let result = await this.homSaleAdminRepository.getDetail(homeCode);
    if (result) {
      let homeImages = await this.homSaleAdminRepository.getImages(result ? result?.seq : 0);
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
    const seq = await this.homSaleAdminRepository.create(dto);
    if (seq) {
      //homeImage
      if (dto.homeImage) {
        await this.homSaleAdminRepository.createImages(seq, dto.createdId, dto.homeImage);
      }
      //homeImages
      if (dto.homeImages.length > 0) {
        for (const file of dto.homeImages) {
          await this.homSaleAdminRepository.createImages(seq, dto.createdId, file);
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
        await this.homSaleAdminRepository.deleteHomeImagesOne((home.homeImage as IHomeSaleImg).seq);

        //insert new homeImage
        await this.homSaleAdminRepository.createImages(home.seq, 'admin', dto.homeImage);
      }

      const fileNeedDeletes: IHomeSaleImg[] = diffByTwoArr(dto.homeImages, home.homeImages, 'filename');
      this.logger.log(logbase, `Danh sách file cần xóa --> ${JSON.stringify(fileNeedDeletes)}`);

      const fileNeedCreates: IHomeSaleImg[] = diffByTwoArr(home.homeImages, dto.homeImages, 'filename');
      this.logger.log(logbase, `Danh sách file cần thêm mới --> ${JSON.stringify(fileNeedCreates)}`);

      // homeImages is changed -> delete old file
      if (fileNeedDeletes.length) {
        // delete db
        await this.homSaleAdminRepository.deleteHomeImagesMulti(fileNeedDeletes.map((ele) => ele.seq));
        // delete physical
        for (const file of fileNeedDeletes) {
          const filepath = `/images/homes/${file.filename}`;
          await this.fileLocalService.deleteLocalFile(filepath);
        }
      }
      if (fileNeedCreates.length) {
        // insert những ảnh mới
        for (const file of fileNeedCreates) {
          const insertImgResult = await this.homSaleAdminRepository.createImages(home.seq, 'admin', file);
          this.logger.log(logbase, `Insdert file mới --> file(${file.filename}) --> result: ${insertImgResult}`);
        }
      }
      const result = await this.homSaleAdminRepository.update(dto, homeCode);
      return result;
    } else {
      return 0;
    }
  }
  async delete(homeCode: string): Promise<number> {
    const home = await this.homSaleAdminRepository.getDetail(homeCode);
    if (home) {
      // const images = await this.homSaleAdminRepository.getImages(home?.seq ?? 0);

      const resultHome = await this.homSaleAdminRepository.delete(homeCode);

      // xóa các file ảnh của nhà yến trong databse
      // if (resultHome) {
      //   await this.homSaleAdminRepository.deleteHomeImages(home?.seq ?? 0);
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

  // TODO: SUBMIT
  async getAllSubmit(dto: PagingDto): Promise<IList<IHomeSaleSubmit>> {
    const total = await this.homSaleAdminRepository.getTotalSubmit();
    const list = await this.homSaleAdminRepository.getAllSubmit(dto);
    return { total, list };
  }
  async getDetailSubmit(seq: number): Promise<IHomeSaleSubmit | null> {
    const result = await this.homSaleAdminRepository.getDetailSubmit(seq);
    return result;
  }
  async updateSubmit(dto: UpdateStatusDto, seq: number): Promise<number> {
    const result = await this.homSaleAdminRepository.updateSubmit(dto, seq);
    return result;
  }
}
