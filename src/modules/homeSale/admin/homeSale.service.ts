import { Injectable } from '@nestjs/common';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { LoggingService } from 'src/common/logger/logger.service';
import { getFileLocation } from 'src/config/multer.config';
import { PagingDto } from 'src/dto/admin.dto';
import { diffByTwoArr } from 'src/helpers/func.helper';
import { HomeSaleImgResDto, HomeSaleResDto, HomeSaleSightSeeingResDto } from "../homeSale.response";
import { CreateHomeDto, UpdateHomeDto, UpdateStatusDto } from './homeSale.dto';
import { HomeSaleAdminRepository } from './homeSale.repository';

@Injectable()
export class HomeSaleAdminService {
  private readonly SERVICE_NAME = 'HomeSaleAdminService';
  constructor(
    private readonly homSaleAdminRepository: HomeSaleAdminRepository,
    private readonly fileLocalService: FileLocalService,
    private readonly logger: LoggingService,
  ) { }
  async getAll(dto: PagingDto): Promise<{ total: number; list: HomeSaleResDto[] }> {
    const total = await this.homSaleAdminRepository.getTotal();
    const list = await this.homSaleAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(homeCode: string): Promise<HomeSaleResDto | null> {
    let result = await this.homSaleAdminRepository.getDetail(homeCode);
    if (result) {
      let homeImages = await this.homSaleAdminRepository.getImages(result ? result?.seq : 0);
      // tách biệt ảnh chính và danh sách ảnh phụ
      let homeImagesExceptMain: HomeSaleImgResDto[] = [];
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
  async create(dto: CreateHomeDto, createdId: string): Promise<number> {
    const homeImagePath = dto.homeImage ? `${getFileLocation(dto.homeImage.mimetype, dto.homeImage.fieldname)}/${dto.homeImage.filename}` : '';
    const seq = await this.homSaleAdminRepository.create(dto, homeImagePath, createdId);
    if (seq) {
      //homeImage
      if (dto.homeImage) {
        await this.homSaleAdminRepository.createImages(seq, createdId, homeImagePath, dto.homeImage);
      }
      //homeImages
      if (dto.homeImages.length > 0) {
        for (const file of dto.homeImages) {
          const filenamePath = `${getFileLocation(file.mimetype, file.fieldname)}/${file.filename}`;
          await this.homSaleAdminRepository.createImages(seq, createdId, filenamePath, file);
        }
      }
    }
    return seq;
  }

  async update(dto: UpdateHomeDto, updatedId: string, homeCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/update`;

    const home = await this.getDetail(homeCode);
    let homeImagePath = (home?.homeImage as HomeSaleImgResDto).filename
    if (home) {
      // homeImage bị thay đổi -> xóa ảnh hiện tại của nó
      if (dto.homeImage.filename !== (home.homeImage as HomeSaleImgResDto).filename) {
        // xóa file local
        await this.fileLocalService.deleteLocalFile((home.homeImage as HomeSaleImgResDto).filename);

        // xóa trong db
        await this.homSaleAdminRepository.deleteHomeImagesOne((home.homeImage as HomeSaleImgResDto).seq);

        // instart file mới vào db
        homeImagePath = `${getFileLocation(dto.homeImage.mimetype, dto.homeImage.fieldname)}/${dto.homeImage.filename}`;
        await this.homSaleAdminRepository.createImages(home.seq, 'admin', homeImagePath, dto.homeImage);
      }

      const fileNeedDeletes: HomeSaleImgResDto[] = diffByTwoArr(dto.homeImages, home.homeImages, 'filename');
      this.logger.log(logbase, `Danh sách file cần xóa --> ${JSON.stringify(fileNeedDeletes.map((fi) => fi.filename))}`);

      const fileNeedCreates: HomeSaleImgResDto[] = diffByTwoArr(home.homeImages, dto.homeImages, 'filename');
      this.logger.log(logbase, `Danh sách file cần thêm mới --> ${JSON.stringify(fileNeedCreates.map((fi) => fi.filename))}`);

      // homeImages bị thay đổi -> xóa ~ ảnh hiện tại của nó
      if (fileNeedDeletes.length) {
        // xóa ~ file local
        await this.homSaleAdminRepository.deleteHomeImagesMulti(fileNeedDeletes.map((ele) => ele.seq));
        // xóa ~ trong db
        for (const file of fileNeedDeletes) {
          await this.fileLocalService.deleteLocalFile(file.filename);
        }
      }
      if (fileNeedCreates.length) {
        // instart ~ file mới vào db
        for (const file of fileNeedCreates) {
          const filenamePath = `${getFileLocation(file.mimetype, file.filename)}/${file.filename}`;
          const insertImgResult = await this.homSaleAdminRepository.createImages(home.seq, 'admin', filenamePath, file);
          this.logger.log(logbase, `Thêm file mới --> file(${file.filename}) --> result: ${insertImgResult}`);
        }
      }
      const result = await this.homSaleAdminRepository.update(dto, homeImagePath, updatedId, homeCode);
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
      return resultHome;
    } else {
      return 0;
    }
  }

  // TODO: SIGHTSEEING
  async getAllSightseeing(dto: PagingDto): Promise<{ total: number; list: HomeSaleSightSeeingResDto[] }> {
    const total = await this.homSaleAdminRepository.getTotalSightseeing();
    const list = await this.homSaleAdminRepository.getAllSightseeing(dto);
    return { total, list };
  }
  async getDetailSightseeing(seq: number): Promise<HomeSaleSightSeeingResDto | null> {
    const result = await this.homSaleAdminRepository.getDetailSightseeing(seq);
    return result;
  }
  async updateSightseeing(dto: UpdateStatusDto, updatedId: string, seq: number): Promise<number> {
    const result = await this.homSaleAdminRepository.updateSightseeing(dto, updatedId, seq);
    return result;
  }
}
