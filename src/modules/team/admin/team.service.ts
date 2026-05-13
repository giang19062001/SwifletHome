import { Injectable } from '@nestjs/common';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { FirebaseService } from 'src/common/firebase/firebase.service';
import { LoggingService } from 'src/common/logger/logger.service';
import { getFileLocation } from 'src/config/multer.config';
import { PagingDto } from 'src/dto/admin.dto';
import { NOTIFICATIONS } from 'src/helpers/text.helper';
import { TeamStatus } from 'src/interfaces/admin.interface';
import { NotificationTypeEnum } from 'src/modules/notification/notification.interface';
import { ChangDisplayReviewDto, CreateTeamDto, DeleteFileDto, TeamImgResDto, TeamResDto, TeamReviewResDto, UpdateTeamDto, UploadServiceFilesDto, UploadTeamFilesDto, UploadTeamMainImageDto } from './team.dto';
import { TeamAdminRepository } from './team.repository';

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
  async getTeamFileTypes(): Promise<any[]> {
    return await this.teamAdminRepository.getTeamFileTypes();
  }

  async getDetail(teamCode: string): Promise<any | null> {
    let result: any = await this.teamAdminRepository.getDetail(teamCode);
    if (result) {
      let teamFiles = await this.teamAdminRepository.getImages(result ? result?.seq : 0);
      // tách biệt ảnh chính và danh sách ảnh phụ
      let teamFilesExceptMain: any[] = [];
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
        let typeGroup = structuredTeamFiles.find(g => g.fileTypeCode === img.fileTypeCode);
        if (!typeGroup) {
          const typeInfo = allFileTypes.find(t => t.fileTypeCode === img.fileTypeCode) || {};
          typeGroup = {
            fileTypeCode: img.fileTypeCode,
            fileTypeText: typeInfo.fileTypeText || '',
            images: []
          };
          structuredTeamFiles.push(typeGroup);
        }
        typeGroup.images.push(img);
      }
      
      result.teamFiles = structuredTeamFiles;

      // get services
      const services = await this.teamAdminRepository.getTeamServices(result.seq);
      for (const svc of services) {
        const svcImages = await this.teamAdminRepository.getTeamServiceImages(svc.seq);
        svc.images = svcImages;
      }
      result.services = services;

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
      const teamImagePath = existingMainImg 
        ? existingMainImg.filename 
        : (dto.teamImage && dto.teamImage.filename
            ? `${getFileLocation(dto.teamImage.mimetype, dto.teamImage.fieldname)}/${dto.teamImage.filename}`
            : typeof dto.teamImage === 'string'
              ? dto.teamImage
              : '');

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
    const home = await this.getDetail(teamCode);
    let teamImagePath = home ? (home?.teamImage as TeamImgResDto).filename : '';
    if (home) {
      if (dto.teamImage && dto.teamImage.filename && dto.teamImage.filename !== (home.teamImage as TeamImgResDto)?.filename) {
        if (home.teamImage) {
          await this.fileLocalService.deleteLocalFile((home.teamImage as TeamImgResDto).filename);
          await this.teamAdminRepository.deleteHomeImagesOne((home.teamImage as TeamImgResDto).seq);
        }
        teamImagePath = `${getFileLocation(dto.teamImage.mimetype, dto.teamImage.fieldname)}/${dto.teamImage.filename}`;
        await this.teamAdminRepository.createImages(home.seq, 'admin', teamImagePath, dto.teamImage);
      } else if (typeof dto.teamImage === 'string') {
        teamImagePath = dto.teamImage;
      }

      await this.teamAdminRepository.updateSeqFilesTeam(home.seq, dto.uniqueId, updatedId);

      const oldServices = await this.teamAdminRepository.getTeamServices(home.seq);
      for (const svc of oldServices) {
        if (dto.servicesData) {
          try {
            const newServices = JSON.parse(dto.servicesData);
            const found = newServices.find((ns: any) => ns.uniqueId === svc.uniqueId);
            if (!found) {
              const oldSvcImages = await this.teamAdminRepository.getTeamServiceImages(svc.seq);
              for (const img of oldSvcImages) {
                await this.fileLocalService.deleteLocalFile(img.filename);
              }
            }
          } catch (e) {}
        }
      }

      await this.teamAdminRepository.deleteTeamServicesByTeam(home.seq);

      if (dto.servicesData) {
        try {
          const services = JSON.parse(dto.servicesData);
          for (let i = 0; i < services.length; i++) {
            const svc = services[i];
            const seqService = await this.teamAdminRepository.createTeamService(home.seq, dto.userTypeCode, svc.serviceTypeCode, svc.serviceTextInput, svc.uniqueId);

            if (svc.uniqueId) {
              await this.teamAdminRepository.updateSeqFilesService(seqService, svc.uniqueId, updatedId);
            }
          }
        } catch (e) {}
      }

      const result = await this.teamAdminRepository.update(dto, teamImagePath, updatedId, teamCode);
      return result;
    } else {
      return 0;
    }
  }
  async delete(teamCode: string): Promise<number> {
    const home = await this.teamAdminRepository.getDetail(teamCode);
    if (home) {
      const resultHome = await this.teamAdminRepository.delete(teamCode);
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

  async updateStatus(teamCode: string, status: TeamStatus, updatedId: string): Promise<number> {
    const team = await this.teamAdminRepository.getDetail(teamCode);
    if (!team) return 0;

    const result = await this.teamAdminRepository.updateStatus(teamCode, status, updatedId);
    if (result > 0) {
      const deviceToken = await this.teamAdminRepository.getUserDeviceToken(team.userCode);
      if (deviceToken) {
      let notification;
      if (status === TeamStatus.APPROVE) {
        notification = NOTIFICATIONS.TEAM_REGISTER_APPROVED(teamCode);
      } else if (status === TeamStatus.REFUSE) {
        notification = NOTIFICATIONS.TEAM_REGISTER_REFUSE(teamCode);
      }

      if (notification) {
        await this.firebaseService.sendNotification(
          team.userCode,
          deviceToken,
          notification.TITLE,
          notification.BODY,
          { teamCode },
          NotificationTypeEnum.ADMIN,
        );
      }
    }
    }
    return result;
  }
}
