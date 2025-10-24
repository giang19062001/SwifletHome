import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
  Res,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { UploadService } from './upload.service';
import { existsSync } from 'fs';
import type { Request, Response } from 'express';
import { ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { UploadFileDto } from './upload.dto';
import { multerConfig } from './upload.config';
import { IFileUpload } from './upload.interface';
import { ApiAuthGuard } from 'src/auth/admin/auth.api.guard';

@ApiTags('admin/uploadFile')
@UseGuards(ApiAuthGuard)
@Controller('/api/admin/uploadFile')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<number> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadService.uploadFile(file);
  }

  @Post('getAllFile')
  @HttpCode(HttpStatus.OK)
  async getAll(): Promise<IFileUpload[]> {
    const result = await this.uploadService.getAllFile();
    return result;
  }

  @Delete('deleteFile/:filename')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'filename', type: String })
  async deleteFile(@Param('filename') filename: string): Promise<number> {
    return await this.uploadService.deleteFile(filename);
  }
}
