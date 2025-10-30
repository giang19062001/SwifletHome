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
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UploadFileDto, UploadVideoLinkDto } from './upload.dto';
import { multerConfig } from './upload.config';
import { IFileUpload } from './upload.interface';
import { ApiAuthGuard } from 'src/modules/auth/admin/auth.api.guard';

@ApiBearerAuth('swf-token')
@ApiTags('admin/uploadFile')
@UseGuards(ApiAuthGuard)
@Controller('/api/admin/uploadFile')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(
    @Body() dto: UploadFileDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<number> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadService.uploadFile(dto.source, file);
  }

  @ApiBody({ type: UploadVideoLinkDto })
  @Post('uploadVideoLink')
  @HttpCode(HttpStatus.OK)
  async uploadVideoLink(@Body() dto: UploadVideoLinkDto): Promise<number> {
    const result = await this.uploadService.uploadVideoLink(dto);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @Post('getAllFile')
  @HttpCode(HttpStatus.OK)
  async getAll(): Promise<IFileUpload[]> {
    const result = await this.uploadService.getAllFile();
    return result;
  }

  @Delete('deleteVideoLink/:seq')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'seq', type: Number  })
  async deleteVideoLink(@Param('seq') seq: number): Promise<number> {
    const result = await this.uploadService.deleteVideoLink(seq);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @Delete('deleteFile/:filename')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'filename', type: String })
  async deleteFile(@Param('filename') filename: string): Promise<number> {
    const result = await this.uploadService.deleteFile(filename);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
}
