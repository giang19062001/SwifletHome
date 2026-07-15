import { Injectable } from '@nestjs/common';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { FirebaseService } from 'src/common/firebase/firebase.service';
import { LoggingService } from 'src/common/logger/logger.service';
import { getFileLocation } from 'src/config/multer.config';
import { PagingDto } from 'src/dto/admin.dto';
import { NOTIFICATIONS } from 'src/helpers/text.helper';
import { TeamStatusEnum } from 'src/interfaces/admin.interface';
import { NotificationTypeEnum } from 'src/modules/notification/common/notification.enum';
import { GetDetailTeamResDto } from '../app/team.response';
import { ChangDisplayReviewDto, CreateTeamDto, DeleteFileDto, UpdateTeamDto, UploadServiceFilesDto, UploadTeamFilesDto, UploadTeamMainImageDto } from './team.dto';
import { TeamAdminRepository } from './team.repository';
import { TeamFileTypeAdminResDto, TeamImgResDto, TeamResDto, TeamReviewResDto, TeamServiceTypeAdminResDto } from './team.response';

@Injectable()
export class TeamAdminService {
  private readonly SERVICE_NAME = 'TeamAdminService';
  constructor(
    private readonly teamAdminRepository: TeamAdminRepository,
    private readonly fileLocalService: FileLocalService,
    private readonly logger: LoggingService,
    private readonly firebaseService: FirebaseService,
  ) {}
  async getAll(dto: PagingDto): Promise<{ total: number; list: TeamResDto[] }> {
    const total = await this.teamAdminRepository.getTotal();
    const list = await this.teamAdminRepository.getAll(dto);
    return { total, list };
  }
  async getTeamFileTypes(): Promise<TeamFileTypeAdminResDto[]> {
    return await this.teamAdminRepository.getTeamFileTypes();
  }

  async getTeamServiceTypes(userTypeCode?: string): Promise<TeamServiceTypeAdminResDto[]> {
    return await this.teamAdminRepository.getTeamServiceTypes(userTypeCode);
  }

  async getDetail(teamCode: string): Promise<GetDetailTeamResDto | null> {
    const result: any = await this.teamAdminRepository.getDetail(teamCode);
    if (result) {
      const teamFiles = await this.teamAdminRepository.getImages(result ? result?.seq : 0);
      // tách biệt ảnh chính và danh sách ảnh phụ
      const teamFilesExceptMain: any[] = [];
      for (const img of teamFiles) {
        if (img.filename == result.teamImage) {
          result.teamImage = img;
        } else {
          teamFilesExceptMain.push(img);
        }
      }
      // góm nhóm các ảnh phụ theo loại ảnh của chúng
      const allFileTypes = await this.getTeamFileTypes();
      const structuredTeamFiles: any[] = [];

      for (const img of teamFilesExceptMain) {
        let typeGroup = structuredTeamFiles.find((g) => g.fileTypeCode === img.fileTypeCode);
        if (!typeGroup) {
          const typeInfo = allFileTypes.find((t) => t.fileTypeCode === img.fileTypeCode);
          typeGroup = {
            fileTypeCode: img.fileTypeCode,
            fileTypeText: typeInfo?.fileTypeText || '',
            images: [],
          };
          structuredTeamFiles.push(typeGroup);
        }
        typeGroup.images.push(img);
      }

      result.teamFiles = structuredTeamFiles;

      // get services
      const services = await this.teamAdminRepository.getTeamServices(result.seq);
      const servicesWithImages: any[] = [];
      for (const svc of services) {
        const svcImages = await this.teamAdminRepository.getTeamServiceFiles(svc.seq);
        servicesWithImages.push({
          ...svc,
          images: svcImages,
        });
      }
      result.services = servicesWithImages;

      return result;
    } else {
      return null;
    }
  }
  async uploadTeamMainImage(dto: UploadTeamMainImageDto, file: Express.Multer.File, createdId: string): Promise<{ seq: number; url: string; mimetype: string }> {
    const filenamePath = `${getFileLocation(file.mimetype, file.fieldname)}/${file.filename}`;
    const seq = await this.teamAdminRepository.uploadFileTeam(dto.uniqueId, createdId, filenamePath, file);
    return { seq, url: filenamePath, mimetype: file.mimetype };
  }

  async uploadTeamFiles(dto: UploadTeamFilesDto, files: Express.Multer.File[], createdId: string): Promise<{ seq: number; url: string; mimetype: string }[]> {
    const result: { seq: number; url: string; mimetype: string }[] = [];
    for (const file of files) {
      const filenamePath = `${getFileLocation(file.mimetype, file.fieldname)}/${file.filename}`;
      const seq = await this.teamAdminRepository.uploadFileTeam(dto.uniqueId, createdId, filenamePath, file, dto.fileTypeCode);
      result.push({ seq, url: filenamePath, mimetype: file.mimetype });
    }
    return result;
  }

  async uploadServiceFiles(dto: UploadServiceFilesDto, files: Express.Multer.File[], createdId: string): Promise<{ seq: number; url: string; mimetype: string }[]> {
    const result: { seq: number; url: string; mimetype: string }[] = [];
    for (const file of files) {
      const filenamePath = `${getFileLocation(file.mimetype, file.fieldname)}/${file.filename}`;
      const seq = await this.teamAdminRepository.uploadFileService(dto.uniqueId, createdId, filenamePath, file);
      result.push({ seq, url: filenamePath, mimetype: file.mimetype });
    }
    return result;
  }

  async deleteFile(dto: DeleteFileDto, updatedId: string): Promise<number> {
    let fileInfo: any = null;
    if (dto.uploadType === 'teamFiles') {
      fileInfo = await this.teamAdminRepository.getFileTeamBySeq(dto.seq);
    } else if (dto.uploadType === 'teamServiceFiles') {
      fileInfo = await this.teamAdminRepository.getFileServiceBySeq(dto.seq);
    } else if (dto.uploadType === 'teamImage') {
      fileInfo = await this.teamAdminRepository.getFileTeamBySeq(dto.seq);
    }

    // delete trong thư mục local
    if (fileInfo && fileInfo.filename) {
      await this.fileLocalService.deleteLocalFile(fileInfo.filename);
    }

    // delete khỏi database
    if (dto.uploadType === 'teamFiles') {
      return await this.teamAdminRepository.deleteFileTeam(dto.seq);
    } else if (dto.uploadType === 'teamServiceFiles') {
      return await this.teamAdminRepository.deleteFileService(dto.seq);
    } else if (dto.uploadType === 'teamImage') {
      if (fileInfo && fileInfo.teamSeq > 0) {
        await this.teamAdminRepository.clearTeamMainImage(fileInfo.teamSeq);
      }
      return await this.teamAdminRepository.deleteFileTeam(dto.seq);
    }
    return 0;
  }

  async create(dto: CreateTeamDto, createdId: string): Promise<number> {
    try {
      const isDuplicate = await this.teamAdminRepository.checkDuplicateTeam(dto.userCode, dto.userTypeCode);
      if (isDuplicate) {
        return -1;
      }
      const existingMainImg = await this.teamAdminRepository.findMainImageByUniqueId(dto.uniqueId);
      const teamImagePath = existingMainImg ? existingMainImg.filename : '';

      const seq = await this.teamAdminRepository.create(dto, teamImagePath, createdId);
      if (seq) {
        // Chỉ lưu ảnh chính nếu chưa được upload trước đó qua uniqueId
        if (!existingMainImg && dto.teamImage && dto.teamImage.filename) {
          await this.teamAdminRepository.createImages(seq, createdId, teamImagePath, dto.teamImage);
        }

        await this.teamAdminRepository.updateSeqFilesTeam(seq, dto.uniqueId, createdId);

        if (dto.servicesData) {
          try {
            const services = JSON.parse(dto.servicesData);
            for (let i = 0; i < services.length; i++) {
              const svc = services[i];
              const seqService = await this.teamAdminRepository.createTeamService(seq, dto.userTypeCode, svc.serviceTypeCode, svc.serviceTextInput, svc.uniqueId);

              if (svc.uniqueId) {
                await this.teamAdminRepository.updateSeqFilesService(seqService, svc.uniqueId, createdId);
              }
            }
          } catch (e) {}
        }
      }
      return seq;
    } catch (error) {
      console.log('error', error);
      return 0;
    }
  }

  async update(dto: UpdateTeamDto, updatedId: string, teamCode: string): Promise<number> {
    // Lấy thông tin chi tiết hiện tại của Team
    const team = await this.getDetail(teamCode);
    if (!team) return 0;

    // Xác định đường dẫn ảnh đại diện hiện tại
    let teamImagePath = '';
    if (team.teamImage) {
      teamImagePath = typeof team.teamImage === 'string' ? team.teamImage : (team.teamImage as TeamImgResDto).filename;
    }

    // Xử lý ảnh đại diện (Main Image)
    // Ưu tiên tìm ảnh mới đã được upload tức thì thông qua uniqueId
    const existingMainImg = await this.teamAdminRepository.findMainImageByUniqueId(dto.uniqueId);

    if (existingMainImg) {
      // Nếu tìm thấy ảnh mới: Thực hiện xóa ảnh cũ (file vật lý và DB) trước khi cập nhật
      if (team.teamImage) {
        const oldFilename = typeof team.teamImage === 'string' ? team.teamImage : (team.teamImage as TeamImgResDto).filename;
        const oldSeq = typeof team.teamImage === 'string' ? 0 : (team.teamImage as TeamImgResDto).seq;

        if (oldFilename && oldFilename !== existingMainImg.filename) {
          await this.fileLocalService.deleteLocalFile(oldFilename);
          if (oldSeq > 0) {
            await this.teamAdminRepository.deleteTeamImageOne(oldSeq);
          }
        }
      }
      // Gán đường dẫn ảnh mới
      teamImagePath = existingMainImg.filename;
    }
    // Nếu không có ảnh mới từ uniqueId, teamImagePath sẽ giữ nguyên giá trị ảnh cũ đã lấy ở Bước 2

    // Liên kết các file (ảnh/video phụ) đã upload tức thì với Team này
    await this.teamAdminRepository.updateSeqFilesTeam(team.seq, dto.uniqueId, updatedId);

    // Xử lý các dịch vụ (Services)
    // Kiểm tra các dịch vụ cũ, nếu không còn trong danh sách mới thì xóa file vật lý của dịch vụ đó
    const oldServices = await this.teamAdminRepository.getTeamServices(team.seq);
    for (const svc of oldServices) {
      if (dto.servicesData) {
        try {
          const newServices = JSON.parse(dto.servicesData);
          const found = newServices.find((ns: any) => ns.uniqueId === svc.uniqueId);
          if (!found) {
            const oldSvcImages = await this.teamAdminRepository.getTeamServiceFiles(svc.seq);
            for (const img of oldSvcImages) {
              await this.fileLocalService.deleteLocalFile(img.filename);
            }
          }
        } catch (e) {}
      }
    }

    // Xóa toàn bộ liên kết dịch vụ cũ trong DB (sẽ tạo lại danh sách mới)
    await this.teamAdminRepository.deleteTeamServicesByTeam(team.seq);

    // Tạo mới các dịch vụ và liên kết file của từng dịch vụ
    if (dto.servicesData) {
      try {
        const services = JSON.parse(dto.servicesData);
        for (let i = 0; i < services.length; i++) {
          const svc = services[i];
          // Lưu thông tin dịch vụ
          const seqService = await this.teamAdminRepository.createTeamService(team.seq, dto.userTypeCode, svc.serviceTypeCode, svc.serviceTextInput, svc.uniqueId);

          // Nếu dịch vụ có ảnh đi kèm (đã upload qua uniqueId), thực hiện liên kết
          if (svc.uniqueId) {
            await this.teamAdminRepository.updateSeqFilesService(seqService, svc.uniqueId, updatedId);
          }
        }
      } catch (e) {}
    }

    // Cập nhật thông tin chính của Team vào database
    const result = await this.teamAdminRepository.update(dto, teamImagePath, updatedId, teamCode);
    return result;
  }
  async delete(teamCode: string): Promise<number> {
    const team = await this.getDetail(teamCode);
    if (team) {
      const filesToDelete: string[] = [];

      // collect main image
      if (team.teamImage && typeof team.teamImage === 'string') {
        filesToDelete.push(team.teamImage);
      } else if (team.teamImage && typeof team.teamImage === 'object' && (team.teamImage as any).filename) {
        filesToDelete.push((team.teamImage as any).filename);
      }

      // collect team files
      if (team.teamFiles) {
        for (const group of team.teamFiles) {
          if (group.images) {
            for (const img of group.images) {
              if (img.filename) {
                filesToDelete.push(img.filename);
              }
            }
          }
        }
      }

      // collect service files
      if (team.services) {
        for (const svc of team.services) {
          if (svc.images) {
            for (const img of svc.images) {
              if (img.filename) {
                filesToDelete.push(img.filename);
              }
            }
          }
        }
      }

      // perform database deletion transaction first
      const resultHome = await this.teamAdminRepository.deleteForce(team.seq, teamCode);

      // delete physical files only if database deletion is successful
      if (resultHome) {
        for (const file of filesToDelete) {
          if (file) {
            try {
              await this.fileLocalService.deleteLocalFile(file);
            } catch (e) {
              this.logger.error(`Error deleting physical file: ${file}`, e);
            }
          }
        }
      }

      return resultHome;
    } else {
      return 0;
    }
  }

  // TODO: REVIEW
  async getAllReview(dto: PagingDto): Promise<{ total: number; list: TeamReviewResDto[] }> {
    const total = await this.teamAdminRepository.getTotalReview();
    const list = await this.teamAdminRepository.getAllReview(dto);
    return { total, list };
  }

  async getDetailReview(seq: number): Promise<TeamReviewResDto | null> {
    const result = await this.teamAdminRepository.getDetailReview(seq);
    return result;
  }

  async changeDisplay(dto: ChangDisplayReviewDto, updatedId: string, seq: number): Promise<number> {
    const result = await this.teamAdminRepository.changeDisplay(dto.isDisplay, updatedId, seq);
    return result;
  }

  async updateStatus(teamCode: string, status: TeamStatusEnum, updatedId: string): Promise<number> {
    const team = await this.teamAdminRepository.getDetail(teamCode);
    if (!team) return 0;

    const result = await this.teamAdminRepository.updateStatus(teamCode, status, updatedId);
    if (result > 0) {
      const deviceToken = await this.teamAdminRepository.getUserDeviceToken(team.userCode);
      if (deviceToken) {
        let notification;
        const typeName = (team as any).userTypeName || '-';

        if (status === TeamStatusEnum.APPROVE) {
          notification = NOTIFICATIONS.TEAM_REGISTER_APPROVED(teamCode, typeName);
        } else if (status === TeamStatusEnum.REFUSE) {
          notification = NOTIFICATIONS.TEAM_REGISTER_REFUSE(teamCode, typeName);
        }

        if (notification) {
          await this.firebaseService.sendNotification(team.userCode, deviceToken, notification.TITLE, notification.BODY, { teamCode }, NotificationTypeEnum.ADMIN);
        }
      }
    }
    return result;
  }
}
