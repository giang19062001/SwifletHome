import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { promises as fs } from 'fs';
import { UploadRepository } from './upload.repository';
import { IFileUpload } from './upload.interface';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly uploadPath = 'public/uploads';
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  
  private ensureUploadDirectoryExists(): void {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  private validateFileType(mimetype: string): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      // 'video/mp4',
      // 'video/mpeg',
      // 'video/ogg',
      // 'video/webm',
      // 'video/avi',
      // 'video/quicktime',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/webm',
      'audio/aac',
    ];

    return allowedTypes.includes(mimetype);
  }

  private async deletePhysicalFile(filename: string): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), this.uploadPath, filename);
      
      try {
        await fs.access(filePath);
      } catch {
        console.warn(`File ${filename} not found in uploads directory`);
        return;
      }

      await fs.unlink(filePath);
      console.log(`File ${filename} deleted successfully from uploads directory`);
    } catch (error) {
      console.error(`Error deleting physical file ${filename}:`, error);
      throw new InternalServerErrorException(`Failed to delete physical file: ${error.message}`);
    }
  }

  constructor(private readonly uploadRepository: UploadRepository) {
    this.ensureUploadDirectoryExists();
  }

  async uploadFile(file: Express.Multer.File): Promise<number> {
    try {
      // Validate file size
      if (file.size > this.maxFileSize) {
        throw new BadRequestException(
          `File size exceeds limit of ${this.maxFileSize / 1024 / 1024}MB`,
        );
      }

      // Validate file type
      if (!this.validateFileType(file.mimetype)) {
        throw new BadRequestException('File type not allowed');
      }

      console.log('file ==> ', file);

      // Save to database
      const result = await this.uploadRepository.uploadFile(file);
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
      const result = await this.uploadRepository.deleteFile(filename);
      
      if (result === 0) {
        throw new NotFoundException(`File ${filename} not found in database`);
      }

      await this.deletePhysicalFile(filename);

      return result
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting file:', error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

}