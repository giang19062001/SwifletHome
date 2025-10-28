import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { promises as fs } from 'fs';
import { UploadRepository } from './upload.repository';
import { IFileUpload } from './upload.interface';
import * as path from 'path';

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

  private async deletePhysicalFile(filepath: string): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), this.uploadPath, filepath);

      try {
        await fs.access(filePath);
      } catch {
        console.warn(`File ${filepath} not found in uploads directory`);
        return;
      }

      await fs.unlink(filePath);
      console.log(
        `File ${filepath} deleted successfully from uploads directory`,
      );
    } catch (error) {
      console.error(`Error deleting physical file ${filepath}:`, error);
      throw new InternalServerErrorException(
        `Failed to delete physical file: ${error.message}`,
      );
    }
  }

  async uploadFile(source: string, file: Express.Multer.File): Promise<number> {
    try {
      console.log('file ==> ', file);

      // Save to database
      const result = await this.uploadRepository.uploadFile(source, file);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error uploading file:', error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async getAllFile(): Promise<IFileUpload[]> {
    try {
      const result = await this.uploadRepository.getAllFile();
      return result;
    } catch (error) {
      console.error('Error getting all files:', error);
      throw new InternalServerErrorException('Failed to get files');
    }
  }

  async deleteFile(filename: string): Promise<number> {
    try {
      // const file = await this.uploadRepository.getFile(filename);
      // console.log("file  ==>'", file);
      
      const result = await this.uploadRepository.deleteFile(filename);

      if (result === 0) {
        throw new NotFoundException(`File ${filename} not found in database`);
      }
      // const filepath = `/${file?.source}/${filename}`
      // await this.deletePhysicalFile(filepath);

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting file:', error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }
}
