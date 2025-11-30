import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { promises as fs } from 'fs';
import { UploadRepository } from './upload.repository';
import { IAudioFreePay, IFileUpload } from './upload.interface';
import * as path from 'path';
import { UploadAudioFilesDto, UploadVideoLinkDto } from './upload.dto';
import { sortByDate } from 'src/helpers/func.helper';
import { LoggingService } from 'src/common/logger/logger.service';
import { Msg } from 'src/helpers/message.helper';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { getFileLocation } from 'src/config/multer.config';

@Injectable()
export class UploadService {
  private readonly SERVICE_NAME = 'UploadService';

  constructor(
    private readonly uploadRepository: UploadRepository,
    private readonly logger: LoggingService,
    private readonly fileLocalService: FileLocalService,
  ) {}
  async uploadImg(file: Express.Multer.File, createdId: string): Promise<number> {
    try {
      const filenamePath = `${getFileLocation(file.mimetype, file.filename)}/${file.filename}`;
      const result = await this.uploadRepository.uploadImg(file, filenamePath, createdId);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(Msg.FileUploadFail);
    }
  }
  async uploadAudioPay(file: Express.Multer.File, createdId: string): Promise<number> {
    try {
      const filenamePath = `${getFileLocation(file.mimetype, file.filename)}/${file.filename}`;
      const result = await this.uploadRepository.uploadAudioPay(file, filenamePath, createdId)
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
      const result = await this.uploadRepository.uploadAudioFree(file, filenamePath, createdId, seqPay);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(Msg.FileUploadFail);
    }
  }

  async uploadVideoLink(dto: UploadVideoLinkDto, createdId: string): Promise<number> {
    const result = await this.uploadRepository.uploadVideoLink(dto, createdId);
    return result;
  }
  async getAllAudioFile(): Promise<IFileUpload[]> {
    const audios = await this.uploadRepository.getAllAudioFile();
    return audios;
  }
  async getAllFile(): Promise<IFileUpload[]> {
    const files = await this.uploadRepository.getAllImgFile();
    const audios = await this.uploadRepository.getAllAudioFile();
    const videos = await this.uploadRepository.getAllVideoLink();
    return sortByDate('createdAt', [...files, ...audios, ...videos]);
  }

  async getFileAudio(filename: string): Promise<IAudioFreePay | null> {
    const files = await this.uploadRepository.getFileAudio(filename);
    return files;
  }
  async deleteVideoLink(seq: number): Promise<number> {
    const result = await this.uploadRepository.deleteVideoLink(seq);
    return result;
  }
  async deleteImg(filename: string): Promise<number> {
    try {
      // const file = await this.uploadRepository.getFileImg(filename);
      // const result = await this.uploadRepository.terminalImg(filename);
      // if (result === 0) {
      //   throw new NotFoundException();
      // }
      // const filepath = `${file?.filename.startsWith('editorImg-') ? 'images/editors' : 'images/homes'}/${filename}`;
      // await this.fileLocalService.deleteLocalFile(filepath);

      const result = await this.uploadRepository.deleteImg(filename);

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
  async deleteAudio(filename: string): Promise<number> {
    try {
      const file = await this.uploadRepository.getFileAudio(filename);

      // await this.uploadRepository.terminalAudio(file?.filenamePay ?? '');
      // await this.uploadRepository.terminalAudio(file?.filenameFree ?? '');
      // await this.fileLocalService.deleteLocalFile(`/audios/editors/${file?.filenamePay}`);
      // await this.fileLocalService.deleteLocalFile(`/audios/editors/${file?.filenameFree}`);

      await this.uploadRepository.deleteAudio(file?.filenamePay ?? '');
      await this.uploadRepository.deleteAudio(file?.filenameFree ?? '');

      return 1;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(Msg.FileDeleteFail);
    }
  }
}
