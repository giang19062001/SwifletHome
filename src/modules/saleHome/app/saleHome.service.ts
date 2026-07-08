import { Injectable } from '@nestjs/common';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { GeoService } from 'src/common/geo/geo.service';
import { MailService } from 'src/common/mail/mail.service';
import { getFileLocation } from 'src/config/multer.config';
import { PagingDto } from 'src/dto/admin.dto';
import { OPTION_CONST } from 'src/modules/options/option.interface';
import { v4 as uuidv4 } from 'uuid';
import { CreateSaleHomeAppDto, UpdateSaleHomeAppDto, UploadFilesAppDto } from './saleHome.dto';
import { SaleHomeAppRepository } from './saleHome.repository';
import { GetAllSaleHomeWrapperResDto, GetDetailSaleHomeResDto, GetInitFormMutationResDto } from './saleHome.response';

@Injectable()
export class SaleHomeAppService {
  constructor(
    private readonly saleHomeAppRepository: SaleHomeAppRepository,
    private readonly geoService: GeoService,
    private readonly fileLocalService: FileLocalService,
    private readonly mailService: MailService,
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
    const result = await Promise.all(
      files.map(async (file) => {
        const filenamePath = `${getFileLocation(file.mimetype, file.fieldname)}/${file.filename}`;
        const seq = await this.saleHomeAppRepository.uploadFileSaleHome(dto.uniqueId, createdId, filenamePath, file, dto.fileTypeCode);
        return { seq, url: filenamePath, mimetype: file.mimetype };
      }),
    );
    return result;
  }

  async createSaleHome(dto: CreateSaleHomeAppDto, userCode: string): Promise<number> {
    const isExist = await this.saleHomeAppRepository.checkExistUniqueIdSaleHome(dto.uniqueId);
    if (isExist) {
      return -1;
    }

    let { latitude, longitude } = dto.homeInfo;
    if (!latitude || !longitude) {
      // const coords = await this.geoService.getCoordinates(dto.homeInfo.homelocation);
      // latitude = coords.latitude;
      // longitude = coords.longitude;
      latitude = 0;
      longitude = 0;
    }

    const seq = await this.saleHomeAppRepository.createSaleHome(dto, userCode, userCode, latitude, longitude);
    if (seq) {
      await this.saleHomeAppRepository.updateSeqFilesSaleHome(seq, dto.uniqueId, userCode);
      // gửi email thông báo có đơn đăng ký nhà yến sale
      this.mailService.sendSaleHomeEmail({
        homeName: dto.homeInfo.homeName,
        userName: dto.hostInfo.hostName,
        userPhone: dto.hostInfo.hostPhone,
        homeAddress: dto.homeInfo.homelocation,
      });
    }
    return seq;
  }

  async updateSaleHome(homeCode: string, dto: UpdateSaleHomeAppDto, userCode: string): Promise<number> {
    let { latitude, longitude } = dto.homeInfo;
    if (!latitude || !longitude) {
      // const coords = await this.geoService.getCoordinates(dto.homeInfo.homelocation);
      // latitude = coords.latitude;
      // longitude = coords.longitude;
      latitude = 0;
      longitude = 0;
    }
    const affected = await this.saleHomeAppRepository.updateSaleHome(homeCode, dto, userCode, latitude, longitude);
    if (affected) {
      const detail = await this.saleHomeAppRepository.getDetailSaleHome(homeCode);
      if (detail && detail.uniqueId) {
        const seq = await this.saleHomeAppRepository.getSeqByHomeCode(homeCode);
        if (seq) {
          await this.saleHomeAppRepository.updateSeqFilesSaleHome(seq, detail.uniqueId, userCode);
        }
      }
    }
    return affected;
  }

  async deleteSaleHome(homeCode: string, userCode: string): Promise<number> {
    return await this.saleHomeAppRepository.deleteSaleHome(homeCode, userCode);
  }

  // TODO: FILE
  async deleteFile(seq: number, userCode: string): Promise<number> {
    const fileInfo = await this.saleHomeAppRepository.getFileSaleHomeBySeq(seq);
    if (!fileInfo || fileInfo.createdId !== userCode) return 0;

    if (fileInfo.filename) {
      await this.fileLocalService.deleteLocalFile(fileInfo.filename);
    }
    return await this.saleHomeAppRepository.deleteFileSaleHome(seq, userCode);
  }

  async getFilesNotUse(): Promise<{ seq: number; filename: string }[]> {
    return await this.saleHomeAppRepository.getFilesNotUse();
  }

  async deleteFileCron(seq: number): Promise<number> {
    return await this.saleHomeAppRepository.deleteFileCron(seq);
  }

  // TODO: GET
  async getAllSaleHomes(dto: PagingDto, userCode: string): Promise<GetAllSaleHomeWrapperResDto> {
    const myTotal = await this.saleHomeAppRepository.getTotalSaleHomes(true, userCode);
    const myList = await this.saleHomeAppRepository.getAllSaleHomes(null, true, userCode);

    const otherTotal = await this.saleHomeAppRepository.getTotalSaleHomes(false, userCode);
    const otherList = await this.saleHomeAppRepository.getAllSaleHomes(dto, false, userCode);

    return {
      myHomes: { total: myTotal, list: myList },
      otherHomes: { total: otherTotal, list: otherList },
    };
  }

  async getDetailSaleHome(homeCode: string): Promise<GetDetailSaleHomeResDto | null> {
    return await this.saleHomeAppRepository.getDetailSaleHome(homeCode);
  }
}
