import { UserAppService } from 'src/modules/user/app/user.service';
import { Injectable } from '@nestjs/common';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { LoggingService } from 'src/common/logger/logger.service';
import { MailService } from 'src/common/mail/mail.service';
import { getFileLocation } from 'src/config/multer.config';
import { ProvinceService } from 'src/modules/province/app/province.service';
import { v4 as uuidv4 } from 'uuid';
import { TeamUserAppRepository } from './team-user.repository';
import { CreateTeamAppDto, SaveDraftAppDto, DeleteFileAppDto, GetAllTeamDto, UploadServiceFilesAppDto, UploadTeamFilesAppDto, UploadTeamMainImageAppDto } from './team.dto';
import { CheckAvailableTeamResDto, GetAllTeamResDto, GetDetailTeamResDto, InitFormCreateTeamAppResDto } from './team.response';

@Injectable()
export class TeamUserAppService {
  private readonly SERVICE_NAME = 'TeamUserAppService';

  constructor(
    private readonly teamUserAppRepository: TeamUserAppRepository,
    private readonly fileLocalService: FileLocalService,
    private readonly provinceService: ProvinceService,
    private readonly logger: LoggingService,
    private readonly mailService: MailService,
    private readonly userAppService: UserAppService,
  ) {}
  // TODO: TEAM
  async checkAvailableTeam(userCode: string, userTypeKeyWord: string): Promise<CheckAvailableTeamResDto | null> {
    const result = await this.teamUserAppRepository.checkAvailableTeam(userCode, userTypeKeyWord);
    return result;
  }
  async getAllTeams(dto: GetAllTeamDto, userCode: string): Promise<{ total: number; list: GetAllTeamResDto[] }> {
    const logbase = `${this.SERVICE_NAME}/getAll:`;
    const total = await this.teamUserAppRepository.getTotalTeams(dto, userCode);
    const list = await this.teamUserAppRepository.getAllTeams(dto, userCode);
    return { total, list };
  }

  async getInitFormCreateTeam(userTypeCode: string, userTypeKeyWord: string): Promise<InitFormCreateTeamAppResDto> {
    const formUuid = uuidv4();
    const teamFileTypes = await this.teamUserAppRepository.getTeamFileTypes(userTypeKeyWord);
    const provinces = await this.provinceService.getAll();

    const serviceOptions = await this.teamUserAppRepository.getTeamServiceTypes(userTypeKeyWord);
    const services = serviceOptions.map((opt) => ({
      serviceTypeCode: opt.serviceTypeCode,
      serviceDescription: opt.serviceTypeName,
      uniqueId: uuidv4(),
    }));

    return {
      uniqueId: formUuid,
      teamFileTypes,
      services,
      provinces: provinces.map((p) => ({
        provinceCode: String(p.provinceCode),
        provinceName: p.provinceName,
      })),
    };
  }

  async getInitFormSubmitTeam(userCode: string, userTypeCode: string, userTypeKeyWord: string): Promise<InitFormCreateTeamAppResDto> {
    const draft = await this.teamUserAppRepository.getDraft(userCode, userTypeKeyWord);
    const formUuid = draft?.uniqueId || uuidv4();
    const teamFileTypes = await this.teamUserAppRepository.getTeamFileTypes(userTypeKeyWord);
    const provinces = await this.provinceService.getAll();

    const serviceOptions = await this.teamUserAppRepository.getTeamServiceTypes(userTypeKeyWord);
    const services = serviceOptions.map((opt) => ({
      serviceTypeCode: opt.serviceTypeCode,
      serviceDescription: opt.serviceTypeName,
      uniqueId: uuidv4(),
    }));

    if (draft) {
      const teamFiles = draft.teamFiles || [];

      const fileTypeMap = new Map(teamFileTypes.map((t) => [t.fileTypeCode, t.fileTypeText]));
      const structuredTeamFilesMap = new Map<string, any>();

      for (const img of teamFiles as any[]) {
        let typeGroup = structuredTeamFilesMap.get(img.fileTypeCode);
        if (!typeGroup) {
          typeGroup = {
            fileTypeCode: img.fileTypeCode,
            fileTypeText: fileTypeMap.get(img.fileTypeCode) || '',
            images: [],
          };
          structuredTeamFilesMap.set(img.fileTypeCode, typeGroup);
        }
        typeGroup.images.push(img);
      }
      draft.teamFiles = Array.from(structuredTeamFilesMap.values());
    }

    return {
      uniqueId: formUuid,
      teamFileTypes,
      services,
      provinces: provinces.map((p) => ({
        provinceCode: String(p.provinceCode),
        provinceName: p.provinceName,
      })),
      draft: draft || null,
    };
  }

  async getDetailTeam(teamCode: string): Promise<GetDetailTeamResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getDetailTeam:`;
    const result: any = await this.teamUserAppRepository.getDetailTeam(teamCode);

    if (!result) {
      return null;
    }

    // Group teamFiles by fileTypeCode
    const teamFiles = result.teamFiles || [];
    const allFileTypes = await this.teamUserAppRepository.getTeamFileTypes(result.userTypeKeyWord);

    await Promise.all(
      teamFiles.map(async (img) => {
        const dimensions = await this.fileLocalService.getImageDimensions(img.filename);
        if (dimensions) {
          img.width = dimensions.width;
          img.height = dimensions.height;
        } else {
          img.width = 0;
          img.height = 0;
        }
      }),
    );

    // Nhóm file bằng Map để tối ưu
    const fileTypeMap = new Map(allFileTypes.map((t) => [t.fileTypeCode, t.fileTypeText]));
    const structuredTeamFilesMap = new Map<string, any>();

    for (const img of teamFiles) {
      let typeGroup = structuredTeamFilesMap.get(img.fileTypeCode);
      if (!typeGroup) {
        typeGroup = {
          fileTypeCode: img.fileTypeCode,
          fileTypeText: fileTypeMap.get(img.fileTypeCode) || '',
          images: [],
        };
        structuredTeamFilesMap.set(img.fileTypeCode, typeGroup);
      }
      typeGroup.images.push(img);
    }

    const structuredTeamFiles = Array.from(structuredTeamFilesMap.values());

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
    // upload các file song song
    const result = await Promise.all(
      files.map(async (file) => {
        const filenamePath = `${getFileLocation(file.mimetype, file.fieldname)}/${file.filename}`;
        const seq = await this.teamUserAppRepository.uploadFileTeam(dto.uniqueId, createdId, filenamePath, file, dto.fileTypeCode);
        return { seq, url: filenamePath, mimetype: file.mimetype };
      }),
    );
    return result;
  }

  async uploadServiceFiles(dto: UploadServiceFilesAppDto, files: Express.Multer.File[], createdId: string): Promise<{ seq: number; url: string; mimetype: string }[]> {
    // upload các file dịch vụ song song
    const result = await Promise.all(
      files.map(async (file) => {
        const filenamePath = `${getFileLocation(file.mimetype, file.fieldname)}/${file.filename}`;
        const seq = await this.teamUserAppRepository.uploadFileService(dto.uniqueId, createdId, filenamePath, file);
        return { seq, url: filenamePath, mimetype: file.mimetype };
      }),
    );
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

  async saveDraft(dto: SaveDraftAppDto, userCode: string): Promise<number> {
    try {
      // Tự động lấy userTypeCode dựa trên userTypeKeyWord (FACTORY / TECHNICAL)
      const userTypeCode = await this.userAppService.getUserTypeCodeByKeyWord(dto.userTypeKeyWord);
      if (!userTypeCode) return 0;

      // Tìm xem người dùng này đã có bản nháp nào trước đó chưa
      const draft = await this.teamUserAppRepository.getDraftSimple(userCode, dto.userTypeKeyWord);

      // Tìm đường dẫn ảnh đại diện (Main Image) dựa vào uniqueId (nếu đã upload trước đó)
      let teamImagePath = '';
      if (dto.uniqueId) {
        const existingMainImg = await this.teamUserAppRepository.findMainImageByUniqueId(dto.uniqueId);
        teamImagePath = existingMainImg ? existingMainImg.filename : '';
      }

      // Nếu chưa có nháp -> Tạo mới (INSERT). Nếu đã có -> Cập nhật (UPDATE)
      let seq: number;
      if (!draft) {
        seq = await this.teamUserAppRepository.createDraft({ ...dto, userTypeCode }, userCode, teamImagePath, userCode);
      } else {
        seq = draft.seq;
        await this.teamUserAppRepository.updateDraft(seq, { ...dto, userTypeCode }, teamImagePath, userCode);
      }

      // Liên kết các file ảnh (không thuộc service) đã upload với ID của bản nháp này
      if (dto.uniqueId && seq) {
        await this.teamUserAppRepository.updateSeqFilesTeam(seq, dto.uniqueId, userCode);
      }

      // Cập nhật danh sách dịch vụ (services)
      const services: any[] = dto.servicesData || [];
      if (services.length > 0 && seq) {
        // Xóa liên kết (set seqService = 0) và xóa toàn bộ service cũ để cập nhật mới (Clear and Replace)
        await this.teamUserAppRepository.deleteServicesByTeamSeq(seq);

        // tạo mới các dịch vụ con song song
        await Promise.all(
          services.map(async (svc: any) => {
            const seqService = await this.teamUserAppRepository.createTeamService(seq, userTypeCode, svc.serviceTypeCode, svc.serviceTextInput, svc.uniqueId);
            if (svc.uniqueId) {
              await this.teamUserAppRepository.updateSeqFilesService(seqService, svc.uniqueId, userCode);
            }
          }),
        );
      }
      return seq;
    } catch (error) {
      this.logger.error(`${this.SERVICE_NAME}/saveDraft: ${error}`);
      return 0;
    }
  }

  async submitTeam(userTypeKeyWord: string, userCode: string): Promise<number> {
    try {
      const draftFull = await this.teamUserAppRepository.getDraft(userCode, userTypeKeyWord);
      if (!draftFull) return -4; // không tìm thấy bản nháp để submit

      const services = draftFull.services || [];
      if (services.length < 1) return -2; // yêu cầu có ít nhất 1 service

      const serviceTypeCodes = services.map((s: any) => s.serviceTypeCode);
      const uniqueServiceTypeCodes = new Set(serviceTypeCodes);
      if (uniqueServiceTypeCodes.size !== serviceTypeCodes.length) {
        return -3; // trùng lặp services
      }

      await this.teamUserAppRepository.submitDraft(draftFull.seq, userCode);

      // gửi email
      this.mailService.sendTeamEmail({
        teamName: draftFull.teamName,
        teamUserName: draftFull.teamUserName,
        teamPhone: draftFull.teamPhone,
        teamAddress: draftFull.teamAddress,
        teamDescription: draftFull.teamDescription,
        userTypeKeyWord: userTypeKeyWord,
      });
      return draftFull.seq;
    } catch (error) {
      this.logger.error(`${this.SERVICE_NAME}/submitTeam: ${error}`);
      return 0;
    }
  }

  // ! WILL DELETE
  async createTeam(dto: CreateTeamAppDto, userCode: string, userTypeCode: string, userTypeKeyWord: string): Promise<number> {
    // Check duplicate team
    const isDuplicate = await this.teamUserAppRepository.checkDuplicateTeam(userCode, userTypeCode);
    if (isDuplicate) {
      return -1; // Đã đăng ký team loại này rồi
    }

    // validate services
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
      // Kiểm tra ảnh chính đã upload chưa (thông qua uniqueId)
      const existingMainImg = await this.teamUserAppRepository.findMainImageByUniqueId(dto.uniqueId);
      const teamImagePath = existingMainImg ? existingMainImg.filename : '';

      // Tạo team
      const seq = await this.teamUserAppRepository.create({ ...dto, userTypeCode }, userCode, teamImagePath, userCode);
      if (seq) {
        // Re-link team files
        await this.teamUserAppRepository.updateSeqFilesTeam(seq, dto.uniqueId, userCode);

        // Tạo services song song
        await Promise.all(
          services.map(async (svc: any) => {
            const seqService = await this.teamUserAppRepository.createTeamService(seq, userTypeCode, svc.serviceTypeCode, svc.serviceTextInput, svc.uniqueId);
            if (svc.uniqueId) {
              await this.teamUserAppRepository.updateSeqFilesService(seqService, svc.uniqueId, userCode);
            }
          }),
        );

        // sendEmail
        this.mailService.sendTeamEmail({ ...dto, userTypeKeyWord });
      }
      return seq;
    } catch (error) {
      this.logger.error(`${this.SERVICE_NAME}/createTeam: ${error}`);
      return 0;
    }
  }

  async getFilesNotUseTeam() {
    return await this.teamUserAppRepository.getFilesNotUseTeam();
  }

  async getFilesNotUseService() {
    return await this.teamUserAppRepository.getFilesNotUseService();
  }

  async deleteFileTeam(seq: number) {
    return await this.teamUserAppRepository.deleteFileTeam(seq);
  }

  async deleteFileService(seq: number) {
    return await this.teamUserAppRepository.deleteFileService(seq);
  }
}
