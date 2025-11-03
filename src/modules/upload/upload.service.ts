import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { promises as fs } from 'fs';
import { UploadRepository } from './upload.repository';
import { IFileUpload } from './upload.interface';
import * as path from 'path';
import { UploadAudioFilesDto, UploadVideoLinkDto } from './upload.dto';
import { sortByDate } from 'src/helpers/func';

@Injectable()
export class UploadService {
  private readonly uploadPath = 'public/uploads';

  constructor(private readonly uploadRepository: UploadRepository) {
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists(): void {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  public async deletePhysicalFile(filepath: string): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), this.uploadPath, filepath);

      try {
        await fs.access(filePath);
      } catch {
        console.warn(`File ${filepath} not found in uploads directory`);
        return;
      }

      await fs.unlink(filePath);
      console.log(`File ${filepath} deleted successfully from uploads directory`);
    } catch (error) {
      console.error(`Error deleting physical file ${filepath}:`, error);
      throw new InternalServerErrorException(`Failed to delete physical file: ${error.message}`);
    }
  }

  async uploadImg(file: Express.Multer.File, createdId: string): Promise<number> {
    try {
      console.log('file ==> ', file);

      const result = await this.uploadRepository.uploadImg(file, createdId);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error uploading file:', error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }
  async uploadAudioPay(file: Express.Multer.File, createdId: string): Promise<number> {
    try {
      console.log('file ==> ', file);

      const result = await this.uploadRepository.uploadAudioPay(file, createdId);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error uploading file:', error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async uploadAudioFree(file: Express.Multer.File, createdId: string, seqPay: number): Promise<number> {
    try {
      console.log('file ==> ', file);

      const result = await this.uploadRepository.uploadAudioFree(file, createdId, seqPay);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error uploading file:', error);
      throw new InternalServerErrorException('Failed to upload file');
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
  async deleteVideoLink(seq: number): Promise<number> {
    const result = await this.uploadRepository.deleteVideoLink(seq);
    return result;
  }
  async deleteImg(filename: string): Promise<number> {
    try {
      console.log('filename', filename);
      const file = await this.uploadRepository.getFileImg(filename);
      console.log("file  ==>'", file);

      // const result = await this.uploadRepository.terminalImg(filename);

      // if (result === 0) {
      //   throw new NotFoundException(`File ${filename} not found in database`);
      // }
      // const filepath = `${file?.filename.startsWith('answerImage-') ? 'images/answers' : 'images/homes'}/${filename}`;
      // await this.deletePhysicalFile(filepath);

       const result = await this.uploadRepository.deleteImg(filename);

      if (result === 0) {
        throw new NotFoundException(`File ${filename} not found in database`);
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting file:', error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }
  async deleteAudio(filename: string): Promise<number> {
    try {
      console.log('filename', filename);
      const file = await this.uploadRepository.getFileAudio(filename);
      console.log("file  ==>'", file);

      // await this.uploadRepository.terminalAudio(file?.filenamePay ?? '');
      // await this.uploadRepository.terminalAudio(file?.filenameFree ?? '');

      // await this.deletePhysicalFile(`/audios/answers/${file?.filenamePay}`);
      // await this.deletePhysicalFile(`/audios/answers/${file?.filenameFree}`);

      await this.uploadRepository.deleteAudio(file?.filenamePay ?? "");
      await this.uploadRepository.deleteAudio(file?.filenameFree ?? "");

      return 1;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting file:', error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }
}
