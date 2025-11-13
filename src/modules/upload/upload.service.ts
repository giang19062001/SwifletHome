import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { promises as fs } from 'fs';
import { UploadRepository } from './upload.repository';
import { IAudioFreePay, IFileUpload } from './upload.interface';
import * as path from 'path';
import { UploadAudioFilesDto, UploadVideoLinkDto } from './upload.dto';
import { sortByDate } from 'src/helpers/func';
import { LoggingService } from 'src/common/logger/logger.service';
import { Msg } from 'src/helpers/message';

@Injectable()
export class UploadService {
  private readonly UPLOAD_PATH = 'public/uploads';
  private readonly SERVICE_NAME = 'UploadService';

  constructor(
    private readonly uploadRepository: UploadRepository,
    private readonly logger: LoggingService,
  ) {
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists(): void {
    if (!existsSync(this.UPLOAD_PATH)) {
      mkdirSync(this.UPLOAD_PATH, { recursive: true });
    }
  }

  public async deletePhysicalFile(filepath: string): Promise<void> {
    const logbase = `${this.SERVICE_NAME}/deletePhysicalFile`;
    try {
      const filePath = path.join(process.cwd(), this.UPLOAD_PATH, filepath);

      try {
        await fs.access(filePath);
      } catch {
        this.logger.error(logbase, `File ${filepath} not found in directory`);
        return;
      }

      await fs.unlink(filePath);
      this.logger.log(logbase, `File ${filepath} deleted successfully from directory`);
    } catch (error) {
      this.logger.error(logbase, `File ${filepath} deleted failed  from directory -> ${error}`);
    }
  }

  async uploadImg(file: Express.Multer.File, createdId: string): Promise<number> {
    try {
      const result = await this.uploadRepository.uploadImg(file, createdId);
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
      const result = await this.uploadRepository.uploadAudioPay(file, createdId);
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
      const result = await this.uploadRepository.uploadAudioFree(file, createdId, seqPay);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(Msg.FileUploadFail);
    }
  }

  async uploadVideoLink(dto: UploadVideoLinkDto): Promise<number> {
    const result = await this.uploadRepository.uploadVideoLink(dto);
    return result;
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
      // await this.deletePhysicalFile(filepath);

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

      // await this.deletePhysicalFile(`/audios/editors/${file?.filenamePay}`);
      // await this.deletePhysicalFile(`/audios/editors/${file?.filenameFree}`);

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
