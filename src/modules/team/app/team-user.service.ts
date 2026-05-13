import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { LoggingService } from 'src/common/logger/logger.service';
import { getFileLocation } from 'src/config/multer.config';
import { Msg } from 'src/helpers/message.helper';
import { OPTION_CONST } from 'src/modules/options/option.interface';
import { OptionService } from 'src/modules/options/option.service';
import { ProvinceService } from 'src/modules/province/province.service';
import { TeamUserAppRepository } from './team-user.repository';
import { CreateTeamAppDto, DeleteFileAppDto, UploadServiceFilesAppDto, UploadTeamFilesAppDto, UploadTeamMainImageAppDto } from './team.dto';
import { GetAllTeamDto } from './team.dto';
import { GetAllTeamResDto, GetDetailTeamResDto, InitFormCreateTeamAppResDto } from './team.response';

@Injectable()
export class TeamUserAppService {
  private readonly SERVICE_NAME = 'TeamUserAppService';

  constructor(
    private readonly teamUserAppRepository: TeamUserAppRepository,
    private readonly fileLocalService: FileLocalService,
    private readonly provinceService: ProvinceService,
    private readonly optionService: OptionService,
    private readonly logger: LoggingService,
  ) { }
  // TODO: TEAM
  async getAllTeams(dto: GetAllTeamDto, userCode: string): Promise<{ total: number; list: GetAllTeamResDto[] }> {
    const logbase = `${this.SERVICE_NAME}/getAll:`;
    const total = await this.teamUserAppRepository.getTotalTeams(dto, userCode);
    const list = await this.teamUserAppRepository.getAllTeams(dto, userCode);
    return { total, list };
  }

  async getInitFormCreateTeam(userTypeCode: string, userTypeKeyWord: string): Promise<InitFormCreateTeamAppResDto> {
    const formUuid = uuidv4();
    const teamFileTypes = await this.teamUserAppRepository.getTeamFileTypes(userTypeCode);
    const provinces = await this.provinceService.getAll();

    const serviceOptions = await this.optionService.getAll({
      mainOption: OPTION_CONST.USER_TEAM.TECHNICAL_TYPE.mainOption,
      subOption: userTypeKeyWord === 'FACTORY' ? 'FACTORY_TYPE' :  userTypeKeyWord === 'TECHNICAL' ? 'TECHNICAL_TYPE' : '',
    });

    const services = serviceOptions.map(opt => ({
      serviceTypeCode: opt.keyOption,
      serviceDescription: opt.valueOption,
      uniqueId: uuidv4(),
    }));

    return {
      uniqueId: formUuid,
      teamFileTypes,
      services,
      provinces: provinces.map(p => ({
        provinceCode: String(p.provinceCode),
        provinceName: p.provinceName,
      })),
    };
  }

  async getDetailTeam(teamCode: string): Promise<GetDetailTeamResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getDetailTeam:`;
    let result: any = await this.teamUserAppRepository.getDetailTeam(teamCode);

    if (!result) {
      return null;
    }

    // Group teamFiles by fileTypeCode
    const teamFiles = result.teamFiles || [];
    const allFileTypes = await this.teamUserAppRepository.getTeamFileTypes(result.userTypeCode);
    const structuredTeamFiles: any[] = [];

    for (const img of teamFiles) {
      // Thêm width, height
      const dimensions = await this.fileLocalService.getImageDimensions(img.filename);
      if (dimensions) {
        img.width = dimensions.width;
        img.height = dimensions.height;
      } else {
        img.width = 0;
        img.height = 0;
      }

      let typeGroup = structuredTeamFiles.find((g) => g.fileTypeCode === img.fileTypeCode);
      if (!typeGroup) {
        const typeInfo = allFileTypes.find((t) => t.fileTypeCode === img.fileTypeCode) || {};
        typeGroup = {
          fileTypeCode: img.fileTypeCode,
          fileTypeText: typeInfo.fileTypeText || '',
          images: [],
        };
        structuredTeamFiles.push(typeGroup);
      }
      typeGroup.images.push(img);
    }

    result.teamFiles = structuredTeamFiles;
    return result;
  }

  // TODO: TEAM REGISTRATION
  async uploadTeamMainImage(dto: UploadTeamMainImageAppDto, file: Express.Multer.File, createdId: string): Promise<{ seq: number; url: string; mimetype: string }> {
    const filenamePath = `${getFileLocation(file.mimetype, file.fieldname)}/${file.filename}`;
    const seq = await this.teamUserAppRepository.uploadFileTeam(dto.uniqueId, createdId, filenamePath, file);
    return { seq, url: filenamePath, mimetype: file.mimetype };
  }

  async uploadTeamFiles(dto: UploadTeamFilesAppDto, files: Express.Multer.File[], createdId: string): Promise<{ seq: number; url: string; mimetype: string }[]> {
    const result: { seq: number; url: string; mimetype: string }[] = [];
    for (const file of files) {
      const filenamePath = `${getFileLocation(file.mimetype, file.fieldname)}/${file.filename}`;
      const seq = await this.teamUserAppRepository.uploadFileTeam(dto.uniqueId, createdId, filenamePath, file, dto.fileTypeCode);
      result.push({ seq, url: filenamePath, mimetype: file.mimetype });
    }
    return result;
  }

  async uploadServiceFiles(dto: UploadServiceFilesAppDto, files: Express.Multer.File[], createdId: string): Promise<{ seq: number; url: string; mimetype: string }[]> {
    const result: { seq: number; url: string; mimetype: string }[] = [];
    for (const file of files) {
      const filenamePath = `${getFileLocation(file.mimetype, file.fieldname)}/${file.filename}`;
      const seq = await this.teamUserAppRepository.uploadFileService(dto.uniqueId, createdId, filenamePath, file);
      result.push({ seq, url: filenamePath, mimetype: file.mimetype });
    }
    return result;
  }

  async deleteFile(dto: DeleteFileAppDto, userCode: string): Promise<number> {
    let fileInfo: any = null;
    if (dto.uploadType === 'teamFiles') {
      fileInfo = await this.teamUserAppRepository.getFileTeamBySeq(dto.seq);
    } else if (dto.uploadType === 'teamServiceFiles') {
      fileInfo = await this.teamUserAppRepository.getFileServiceBySeq(dto.seq);
    } else if (dto.uploadType === 'teamImage') {
      fileInfo = await this.teamUserAppRepository.getFileTeamBySeq(dto.seq);
    }

    // delete trong thư mục local
    if (fileInfo && fileInfo.filename) {
      await this.fileLocalService.deleteLocalFile(fileInfo.filename);
    }

    // delete khỏi database
    if (dto.uploadType === 'teamFiles') {
      return await this.teamUserAppRepository.deleteFileTeam(dto.seq);
    } else if (dto.uploadType === 'teamServiceFiles') {
      return await this.teamUserAppRepository.deleteFileService(dto.seq);
    } else if (dto.uploadType === 'teamImage') {
      if (fileInfo && fileInfo.teamSeq > 0) {
        await this.teamUserAppRepository.clearTeamMainImage(fileInfo.teamSeq);
      }
      return await this.teamUserAppRepository.deleteFileTeam(dto.seq);
    }
    return 0;
  }

  /**
   * Đăng ký team từ phía App
   * Validate:
   * - Không trùng team (user + userTypeCode)
   * - Số lượng dịch vụ >= 1
   * - Không có dịch vụ trùng nhau
   */
  async createTeam(dto: CreateTeamAppDto, userCode: string, userTypeCode: string): Promise<number> {
    // 1. Check duplicate team
    const isDuplicate = await this.teamUserAppRepository.checkDuplicateTeam(userCode, userTypeCode);
    if (isDuplicate) {
      return -1; // Đã đăng ký team loại này rồi
    }

    // 2. validate services
    const services: any[] = dto.servicesData || [];

    // Validate: Số lượng dịch vụ >= 1
    if (!services || services.length < 1) {
      return -2; // Phải có ít nhất 1 dịch vụ
    }

    // Validate: Không trùng dịch vụ
    const serviceTypeCodes = services.map((s: any) => s.serviceTypeCode);
    const uniqueServiceTypeCodes = new Set(serviceTypeCodes);
    if (uniqueServiceTypeCodes.size !== serviceTypeCodes.length) {
      return -3; // Có dịch vụ trùng nhau
    }

    try {
      // 3. Kiểm tra ảnh chính đã upload chưa (thông qua uniqueId)
      const existingMainImg = await this.teamUserAppRepository.findMainImageByUniqueId(dto.uniqueId);
      const teamImagePath = existingMainImg ? existingMainImg.filename : '';

      // 4. Tạo team
      const seq = await this.teamUserAppRepository.create({ ...dto, userTypeCode }, userCode, teamImagePath, userCode);
      if (seq) {
        // Re-link team files
        await this.teamUserAppRepository.updateSeqFilesTeam(seq, dto.uniqueId, userCode);

        // 5. Tạo services
        for (let i = 0; i < services.length; i++) {
          const svc = services[i];
          const seqService = await this.teamUserAppRepository.createTeamService(seq, userTypeCode, svc.serviceTypeCode, svc.serviceDescription, svc.uniqueId);
          if (svc.uniqueId) {
            await this.teamUserAppRepository.updateSeqFilesService(seqService, svc.uniqueId, userCode);
          }
        }
      }
      return seq;
    } catch (error) {
      this.logger.error(`${this.SERVICE_NAME}/createTeam: ${error}`);
      return 0;
    }
  }
}
