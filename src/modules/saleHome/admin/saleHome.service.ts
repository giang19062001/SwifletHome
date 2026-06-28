import { Injectable } from '@nestjs/common';
import { getFileLocation } from 'src/config/multer.config';
import { v4 as uuidv4 } from 'uuid';
import { GeoService } from 'src/common/geo/geo.service';
import { OPTION_CONST } from 'src/modules/options/option.interface';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { PagingDto } from 'src/dto/admin.dto';
import { CreateSaleHomeAdminDto, UpdateSaleHomeAdminDto, UploadFilesAdminDto, UpdateStatusSaleHomeDto } from './saleHome.dto';
import { SaleHomeAdminRepository } from './saleHome.repository';
import { GetInitFormMutationResDto } from '../app/saleHome.response';
import { GetAllSaleHomeAdminResDto, GetDetailSaleHomeAdminResDto } from '../saleHome.response';

@Injectable()
export class SaleHomeAdminService {
  constructor(
    private readonly saleHomeAdminRepository: SaleHomeAdminRepository,
    private readonly geoService: GeoService,
    private readonly fileLocalService: FileLocalService,
  ) {}

  async getInitFormOptions(): Promise<Omit<GetInitFormMutationResDto, 'uniqueId'>> {
    const options = await this.saleHomeAdminRepository.getHomeSaleOptions();
    const fileTypes = await this.saleHomeAdminRepository.getHomeSaleFileTypes();
    return {
      fileTypes: fileTypes.map((f) => ({ fileTypeCode: f.fileTypeCode, fileTypeText: f.fileTypeText })),
      hostRole: options.filter((o) => o.subOption === OPTION_CONST.SALE_HOME.HOST_ROLE.subOption).map((o) => ({ code: o.code, keyOption: o.keyOption, valueOption: o.valueOption })),
      homeModel: options.filter((o) => o.subOption === OPTION_CONST.SALE_HOME.HOME_MODEL.subOption).map((o) => ({ code: o.code, keyOption: o.keyOption, valueOption: o.valueOption })),
      topicsShare: options.filter((o) => o.subOption === OPTION_CONST.SALE_HOME.TOPICS_SHARE.subOption).map((o) => ({ code: o.code, keyOption: o.keyOption, valueOption: o.valueOption })),
      sightseeingAreas: options.filter((o) => o.subOption === OPTION_CONST.SALE_HOME.SIGHTSEEING_AREAS.subOption).map((o) => ({ code: o.code, keyOption: o.keyOption, valueOption: o.valueOption })),
      includedServices: options.filter((o) => o.subOption === OPTION_CONST.SALE_HOME.INCLUDED_SERVICES.subOption).map((o) => ({ code: o.code, keyOption: o.keyOption, valueOption: o.valueOption })),
      availableDays: options.filter((o) => o.subOption === OPTION_CONST.SALE_HOME.AVAILABLE_DAYS.subOption).map((o) => ({ code: o.code, keyOption: o.keyOption, valueOption: o.valueOption })),
      commitments: options.filter((o) => o.subOption === OPTION_CONST.SALE_HOME.COMMITMENTS.subOption).map((o) => ({ code: o.code, keyOption: o.keyOption, valueOption: o.valueOption })),
    };
  }

  async uploadFiles(dto: UploadFilesAdminDto, files: Express.Multer.File[], createdId: string): Promise<{ seq: number; url: string; mimetype: string }[]> {
    const result: { seq: number; url: string; mimetype: string }[] = [];
    for (const file of files) {
      const filenamePath = `${getFileLocation(file.mimetype, file.fieldname)}/${file.filename}`;
      const seq = await this.saleHomeAdminRepository.uploadFileSaleHome(dto.uniqueId, createdId, filenamePath, file, dto.fileTypeCode);
      result.push({ seq, url: filenamePath, mimetype: file.mimetype });
    }
    return result;
  }

  async deleteFile(seq: number): Promise<number> {
    const fileInfo = await this.saleHomeAdminRepository.getFileSaleHomeBySeq(seq);
    if (!fileInfo) return 0;

    if (fileInfo.filename) {
      await this.fileLocalService.deleteLocalFile(fileInfo.filename);
    }
    return await this.saleHomeAdminRepository.deleteFileSaleHome(seq);
  }

  async getAllSaleHomes(dto: PagingDto): Promise<{ total: number; list: GetAllSaleHomeAdminResDto[] }> {
    const total = await this.saleHomeAdminRepository.getTotalSaleHomes(dto);
    const list = await this.saleHomeAdminRepository.getAllSaleHomes(dto);
    return { total, list };
  }

  async getDetailSaleHome(homeCode: string): Promise<GetDetailSaleHomeAdminResDto | null> {
    return await this.saleHomeAdminRepository.getDetailSaleHome(homeCode);
  }

  async createSaleHome(dto: CreateSaleHomeAdminDto, createdId: string): Promise<number> {
    const isExist = await this.saleHomeAdminRepository.checkExistUniqueIdSaleHome(dto.uniqueId);
    if (isExist) {
      return -1;
    }

    const coords = await this.geoService.getCoordinates(dto.homeInfo.homelocation);
    const seq = await this.saleHomeAdminRepository.createSaleHome(dto, createdId, coords.latitude, coords.longitude);
    if (seq) {
      await this.saleHomeAdminRepository.updateSeqFilesSaleHome(seq, dto.uniqueId, createdId);
    }
    return seq;
  }

  async updateSaleHome(homeCode: string, dto: UpdateSaleHomeAdminDto, updatedId: string): Promise<number> {
    const coords = await this.geoService.getCoordinates(dto.homeInfo.homelocation);
    const affected = await this.saleHomeAdminRepository.updateSaleHome(homeCode, dto, updatedId, coords.latitude, coords.longitude);
    if (affected) {
      const seq = await this.saleHomeAdminRepository.getSeqByHomeCode(homeCode);
      if (seq) {
        await this.saleHomeAdminRepository.updateSeqFilesSaleHome(seq, dto.uniqueId, updatedId);
      }
    }
    return affected;
  }

  async updateStatus(homeCode: string, dto: UpdateStatusSaleHomeDto, updatedId: string): Promise<number> {
    return await this.saleHomeAdminRepository.updateStatus(homeCode, dto.status, updatedId);
  }
}
