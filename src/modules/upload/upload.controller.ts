import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Get, Res, Param, Req, UseGuards, HttpCode, HttpStatus, Delete, Body, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { UploadAudioFilesDto, UploadImgFileDto, UploadVideoLinkDto } from './upload.dto';
import { IAudioFreePay, IFileUpload } from './upload.interface';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { multerAudioConfig, multerImgConfig } from 'src/config/multer.config';
import { Msg } from 'src/helpers/message.helper';
import * as userInterface from '../user/admin/user.interface';
import { GetUserAdmin } from 'src/decorator/auth.decorator';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/uploadFile')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/uploadFile')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('uploadImg')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImgFileDto })
  @UseInterceptors(FileInterceptor('editorImg', multerImgConfig))
  async uploadImg(@Body() dto: UploadImgFileDto, @UploadedFile() file: Express.Multer.File, @GetUserAdmin() admin: userInterface.IUserAdmin): Promise<number> {
    if (!file) {
      throw new BadRequestException(Msg.FileEmpty);
    }

    return this.uploadService.uploadImg(file, admin.userId);
  }

  @Post('uploadAudios')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadAudioFilesDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'editorAudioFree', maxCount: 1 },
        { name: 'editorAudioPay', maxCount: 1 },
      ],
      multerAudioConfig,
    ),
  )
  async uploadAudios(
    @Body() dto: UploadAudioFilesDto,
    @GetUserAdmin() admin: userInterface.IUserAdmin,
    @UploadedFiles()
    files: {
      editorAudioFree?: Express.Multer.File;
      editorAudioPay?: Express.Multer.File;
    },
  ) {
    if (!files.editorAudioFree || !files.editorAudioPay) {
      throw new BadRequestException(Msg.FileAudioRequire);
    }

    try {
      const seqPay = await this.uploadService.uploadAudioPay(files.editorAudioPay[0], admin.userId);
      if (seqPay) {
        await this.uploadService.uploadAudioFree(files.editorAudioFree[0], admin.userId, seqPay);
      }
      return 1;
    } catch (error) {
      return 0;
    }
  }
  @ApiBody({ type: UploadVideoLinkDto })
  @Post('uploadVideoLink')
  @HttpCode(HttpStatus.OK)
  async uploadVideoLink(@Body() dto: UploadVideoLinkDto, @GetUserAdmin() admin: userInterface.IUserAdmin): Promise<number> {
    const result = await this.uploadService.uploadVideoLink(dto, admin.userId);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @Get('getAllFile')
  @HttpCode(HttpStatus.OK)
  async getAll(): Promise<IFileUpload[]> {
    const result = await this.uploadService.getAllFile();
    return result;
  }

  @Get('getFileAudio/:filename')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'filename', type: String })
  async getFileAudio(@Param('filename') filename: string): Promise<IAudioFreePay | null> {
    const result = await this.uploadService.getFileAudio(filename);
    return result;
  }

  @Delete('deleteVideoLink/:seq')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'seq', type: Number })
  async deleteVideoLink(@Param('seq') seq: number): Promise<number> {
    const result = await this.uploadService.deleteVideoLink(seq);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @Delete('deleteAudio/:filename')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'filename', type: String })
  async deleteAudio(@Param('filename') filename: string): Promise<number> {
    const result = await this.uploadService.deleteAudio(filename);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
  @Delete('deleteImg/:filename')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'filename', type: String })
  async deleteImg(@Param('filename') filename: string): Promise<number> {
    const result = await this.uploadService.deleteImg(filename);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
}
