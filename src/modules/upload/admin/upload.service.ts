import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { promises as fs } from 'fs';
import { UploadAdminRepository } from './upload.repository';
import { IAudioFreePay, IFileMedia, IFileUpload } from '../upload.interface';
import * as path from 'path';
import { UploadAudioFilesDto, UploadMediaAudioFilesDto, UploadMediaVideoLinkDto, UploadVideoLinkDto } from './upload.dto';
import { sortByDate } from 'src/helpers/func.helper';
import { LoggingService } from 'src/common/logger/logger.service';
import { Msg } from 'src/helpers/message.helper';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { getFileLocation } from 'src/config/multer.config';

@Injectable()
export class UploadAdminService {
  private readonly SERVICE_NAME = 'UploadAdminService';

  constructor(
    private readonly uploadAdminRepository: UploadAdminRepository,
    private readonly logger: LoggingService,
    private readonly fileLocalService: FileLocalService,
  ) {}
  //* img
  async uploadImg(file: Express.Multer.File, createdId: string): Promise<number> {
    try {
      const filenamePath = `${getFileLocation(file.mimetype, file.filename)}/${file.filename}`;
      const result = await this.uploadAdminRepository.uploadImg(file, filenamePath, createdId);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(Msg.FileUploadFail);
    }
  }
  //* audio
  async uploadAudioPay(file: Express.Multer.File, createdId: string): Promise<number> {
    try {
      const filenamePath = `${getFileLocation(file.mimetype, file.filename)}/${file.filename}`;
      const result = await this.uploadAdminRepository.uploadAudioPay(file, filenamePath, createdId);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(Msg.FileUploadFail);
    }
  }

  async uploadAudioFree(file: Express.Multer.File, createdId: string, seqPay: number): Promise<number> {
    try {
      const filenamePath = `${getFileLocation(file.mimetype, file.filename)}/${file.filename}`;
      const result = await this.uploadAdminRepository.uploadAudioFree(file, filenamePath, createdId, seqPay);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(Msg.FileUploadFail);
    }
  }

  async uploadMediaAudioPay(file: Express.Multer.File, createdId: string, dto: UploadMediaAudioFilesDto): Promise<number> {
    try {
      const filenamePath = `${getFileLocation(file.mimetype, file.filename)}/${file.filename}`;
      const result = await this.uploadAdminRepository.uploadMediaAudioPay(file, filenamePath, createdId, dto);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(Msg.FileUploadFail);
    }
  }
  async uploadMediaAudioFree(file: Express.Multer.File, createdId: string, dto: UploadMediaAudioFilesDto, seqPay: number): Promise<number> {
    try {
      const filenamePath = `${getFileLocation(file.mimetype, file.filename)}/${file.filename}`;
      const result = await this.uploadAdminRepository.uploadMediaAudioFree(file, filenamePath, createdId, dto, seqPay);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(Msg.FileUploadFail);
    }
  }

  //*video
  async uploadVideoLink(dto: UploadVideoLinkDto, createdId: string): Promise<number> {
    const result = await this.uploadAdminRepository.uploadVideoLink(dto, createdId);
    return result;
  }
  async uploadMediaVideoLink(dto: UploadMediaVideoLinkDto, createdId: string): Promise<number> {
    const result = await this.uploadAdminRepository.uploadMediaVideoLink(dto, createdId);
    return result;
  }
  //* get
  async getAllAudioFile(): Promise<IFileUpload[]> {
    const audios = await this.uploadAdminRepository.getAllAudioFile();
    return audios;
  }
  async getAllFile(): Promise<IFileUpload[]> {
    const files = await this.uploadAdminRepository.getAllImgFile();
    const audios = await this.uploadAdminRepository.getAllAudioFile();
    const videos = await this.uploadAdminRepository.getAllVideoLink();
    return sortByDate('createdAt', [...files, ...audios, ...videos]);
  }
  async getAllMediaAudioFile(): Promise<IFileMedia[]> {
    const audios = await this.uploadAdminRepository.getAllMediaAudioFile();
    return sortByDate('createdAt', [...audios]);
  }

  async getAllMediaVideoLink(): Promise<IFileMedia[]> {
    const videos = await this.uploadAdminRepository.getAllMediaVideoLink();
    return sortByDate('createdAt', [...videos]);
  }
  async getFileAudio(seq: number): Promise<IAudioFreePay | null> {
    const files = await this.uploadAdminRepository.getFileAudio(seq);
    return files;
  }

  //*delete video
  async deleteVideoLink(seq: number): Promise<number> {
    const result = await this.uploadAdminRepository.deleteVideoLink(seq);
    return result;
  }
  async deleteMediaVideoLink(seq: number): Promise<number> {
    const result = await this.uploadAdminRepository.deleteMediaVideoLink(seq);
    return result;
  }
  //*delete audio
  async deleteAudio(seq: number): Promise<number> {
    try {
      const file = await this.uploadAdminRepository.getFileAudio(seq);

      // await this.uploadAdminRepository.terminalAudio(file?.filenamePay ?? '');
      // await this.uploadAdminRepository.terminalAudio(file?.filenameFree ?? '');
      // await this.fileLocalService.deleteLocalFile(`/audios/editors/${file?.filenamePay}`);
      // await this.fileLocalService.deleteLocalFile(`/audios/editors/${file?.filenameFree}`);

      await this.uploadAdminRepository.deleteAudio(file?.filenamePay ?? '');
      await this.uploadAdminRepository.deleteAudio(file?.filenameFree ?? '');

      return 1;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(Msg.FileDeleteFail);
    }
  }
  async deleteMediaAudio(seq: number): Promise<number> {
    try {
      const file = await this.uploadAdminRepository.getFileMediaAudio(seq);
      await this.uploadAdminRepository.deleteMediaAudio(file?.filenamePay ?? '');
      await this.uploadAdminRepository.deleteMediaAudio(file?.filenameFree ?? '');

      return 1;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(Msg.FileDeleteFail);
    }
  }
  //*delete img
  async deleteImg(seq: number): Promise<number> {
    try {
      // const file = await this.uploadAdminRepository.getFileImg(filename);
      // const result = await this.uploadAdminRepository.terminalImg(filename);
      // if (result === 0) {
      //   throw new NotFoundException();
      // }
      // const filepath = `${file?.filename.startsWith('editorImg-') ? 'images/editors' : 'images/homes'}/${filename}`;
      // await this.fileLocalService.deleteLocalFile(filepath);

      const result = await this.uploadAdminRepository.deleteImg(seq);

      if (result === 0) {
        throw new NotFoundException();
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(Msg.FileDeleteFail);
    }
  }
}
