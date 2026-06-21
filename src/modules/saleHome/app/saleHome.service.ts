import { BadRequestException, Injectable } from '@nestjs/common';
import { getFileLocation } from 'src/config/multer.config';
import { OPTION_CONST } from 'src/modules/options/option.interface';
import { v4 as uuidv4 } from 'uuid';
import { GeoService } from 'src/common/geo/geo.service';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { CreateSaleHomeAppDto, UploadFilesAppDto } from './saleHome.dto';
import { SaleHomeAppRepository } from './saleHome.repository';
import { GetAllSaleHomeResDto, GetDetailSaleHomeResDto, GetInitFormMutationResDto } from './saleHome.response';
import { PagingDto } from 'src/dto/admin.dto';

@Injectable()
export class SaleHomeAppService {
  constructor(
    private readonly saleHomeAppRepository: SaleHomeAppRepository,
    private readonly geoService: GeoService,
    private readonly fileLocalService: FileLocalService,
  ) {}

  async getInitFormMutation(): Promise<GetInitFormMutationResDto> {
    const options = await this.saleHomeAppRepository.getHomeSaleOptions();
    const fileTypes = await this.saleHomeAppRepository.getHomeSaleFileTypes();

    const result = new GetInitFormMutationResDto();
    result.uniqueId = uuidv4();

    result.hostRole = options.filter((o) => o.subOption === OPTION_CONST.SALE_HOME.HOST_ROLE.subOption).map((o) => ({ code: o.code, keyOption: o.keyOption, valueOption: o.valueOption }));
    result.homeModel = options.filter((o) => o.subOption === OPTION_CONST.SALE_HOME.HOME_MODEL.subOption).map((o) => ({ code: o.code, keyOption: o.keyOption, valueOption: o.valueOption }));
    result.topicsShare = options.filter((o) => o.subOption === OPTION_CONST.SALE_HOME.TOPICS_SHARE.subOption).map((o) => ({ code: o.code, keyOption: o.keyOption, valueOption: o.valueOption }));
    result.sightseeingAreas = options
      .filter((o) => o.subOption === OPTION_CONST.SALE_HOME.SIGHTSEEING_AREAS.subOption)
      .map((o) => ({ code: o.code, keyOption: o.keyOption, valueOption: o.valueOption }));
    result.includedServices = options
      .filter((o) => o.subOption === OPTION_CONST.SALE_HOME.INCLUDED_SERVICES.subOption)
      .map((o) => ({ code: o.code, keyOption: o.keyOption, valueOption: o.valueOption }));
    result.availableDays = options.filter((o) => o.subOption === OPTION_CONST.SALE_HOME.AVAILABLE_DAYS.subOption).map((o) => ({ code: o.code, keyOption: o.keyOption, valueOption: o.valueOption }));
    result.commitments = options.filter((o) => o.subOption === OPTION_CONST.SALE_HOME.COMMITMENTS.subOption).map((o) => ({ code: o.code, keyOption: o.keyOption, valueOption: o.valueOption }));

    result.fileTypes = fileTypes.map((f) => ({ fileTypeCode: f.fileTypeCode, fileTypeText: f.fileTypeText }));

    return result;
  }

  async uploadFiles(dto: UploadFilesAppDto, files: Express.Multer.File[], createdId: string): Promise<{ seq: number; url: string; mimetype: string }[]> {
    const result: { seq: number; url: string; mimetype: string }[] = [];
    for (const file of files) {
      const filenamePath = `${getFileLocation(file.mimetype, file.fieldname)}/${file.filename}`;
      const seq = await this.saleHomeAppRepository.uploadFileSaleHome(dto.uniqueId, createdId, filenamePath, file, dto.fileTypeCode);
      result.push({ seq, url: filenamePath, mimetype: file.mimetype });
    }
    return result;
  }

  async createSaleHome(dto: CreateSaleHomeAppDto, userCode: string): Promise<number> {
    const isExist = await this.saleHomeAppRepository.checkExistUniqueIdSaleHome(dto.uniqueId);
    if (isExist) {
      return -1;
    }

    const coords = await this.geoService.getCoordinates(dto.homeInfo.homelocation);

    const seq = await this.saleHomeAppRepository.createSaleHome(dto, userCode, userCode, coords.latitude, coords.longitude);
    if (seq) {
      await this.saleHomeAppRepository.updateSeqFilesSaleHome(seq, dto.uniqueId, userCode);
    }
    return seq;
  }

  async deleteFile(seq: number, userCode: string): Promise<number> {
    const fileInfo = await this.saleHomeAppRepository.getFileSaleHomeBySeq(seq);
    if (!fileInfo || fileInfo.createdId !== userCode) return 0;

    if (fileInfo.filename) {
      await this.fileLocalService.deleteLocalFile(fileInfo.filename);
    }
    return await this.saleHomeAppRepository.deleteFileSaleHome(seq, userCode);
  }

  async getFilesNotUse(): Promise<any[]> {
    return await this.saleHomeAppRepository.getFilesNotUse();
  }

  async deleteFileCron(seq: number): Promise<number> {
    return await this.saleHomeAppRepository.deleteFileCron(seq);
  }

  async getAllSaleHomes(dto: PagingDto, userCode: string): Promise<{ total: number; list: GetAllSaleHomeResDto[] }> {
    const total = await this.saleHomeAppRepository.getTotalSaleHomes(dto, userCode);
    const list = await this.saleHomeAppRepository.getAllSaleHomes(dto, userCode);
    return { total, list };
  }

  async getDetailSaleHome(homeCode: string): Promise<GetDetailSaleHomeResDto | null> {
    return await this.saleHomeAppRepository.getDetailSaleHome(homeCode);
  }
}
