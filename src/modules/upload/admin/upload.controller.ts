import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Get, Res, Param, Req, UseGuards, HttpCode, HttpStatus, Delete, Body, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { UploadAudioFilesDto, UploadImgFileDto, UploadMediaAudioFilesDto, UploadMediaVideoLinkDto, UploadVideoLinkDto } from './upload.dto';
import { IAudioFreePay, IFileUpload } from '../upload.interface';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { multerAudioConfig, multerImgConfig } from 'src/config/multer.config';
import { Msg } from 'src/helpers/message.helper';
import * as userInterface from '../../auth/admin/auth.interface';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { UploadAdminService } from './upload.service';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/upload')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/upload')
export class UploadAdminController {
  constructor(private readonly uploadAdminService: UploadAdminService) {}

  @Post('uploadImg')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImgFileDto })
  @UseInterceptors(FileInterceptor('editorImg', multerImgConfig))
  async uploadImg(@Body() dto: UploadImgFileDto, @UploadedFile() file: Express.Multer.File, @GetUserAdmin() admin: userInterface.ITokenUserAdmin): Promise<number> {
    if (!file) {
      throw new BadRequestException(Msg.FileEmpty);
    }

    return this.uploadAdminService.uploadImg(file, admin.userId);
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

  //* audio
  async uploadAudios(
    @Body() dto: UploadAudioFilesDto,
    @GetUserAdmin() admin: userInterface.ITokenUserAdmin,
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
      const seqPay = await this.uploadAdminService.uploadAudioPay(files.editorAudioPay[0], admin.userId);
      if (seqPay) {
        await this.uploadAdminService.uploadAudioFree(files.editorAudioFree[0], admin.userId, seqPay);
      }
      return 1;
    } catch (error) {
      return 0;
    }
  }

  @Post('uploadMediaAudios')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadMediaAudioFilesDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'mediaAudioFree', maxCount: 1 },
        { name: 'mediaAudioPay', maxCount: 1 },
      ],
      multerAudioConfig,
    ),
  )
  async uploadMediaAudios(
    @Body() dto: UploadMediaAudioFilesDto,
    @GetUserAdmin() admin: userInterface.ITokenUserAdmin,
    @UploadedFiles()
    files: {
      mediaAudioFree?: Express.Multer.File;
      mediaAudioPay?: Express.Multer.File;
    },
  ) {
    if (!files.mediaAudioFree || !files.mediaAudioPay) {
      throw new BadRequestException(Msg.FileAudioRequire);
    }

    try {
      const seqPay = await this.uploadAdminService.uploadMediaAudioPay(files.mediaAudioPay[0], admin.userId);
      if (seqPay) {
        await this.uploadAdminService.uploadMediaAudioFree(files.mediaAudioFree[0], admin.userId, seqPay);
      }
      return 1;
    } catch (error) {
      return 0;
    }
  }

  //* video
  @ApiBody({ type: UploadVideoLinkDto })
  @Post('uploadVideoLink')
  @HttpCode(HttpStatus.OK)
  async uploadVideoLink(@Body() dto: UploadVideoLinkDto, @GetUserAdmin() admin: userInterface.ITokenUserAdmin): Promise<number> {
    const result = await this.uploadAdminService.uploadVideoLink(dto, admin.userId);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
  @ApiBody({ type: UploadMediaVideoLinkDto })
  @Post('uploadMediaVideoLink')
  @HttpCode(HttpStatus.OK)
  async uploadMediaVideoLink(@Body() dto: UploadMediaVideoLinkDto, @GetUserAdmin() admin: userInterface.ITokenUserAdmin): Promise<number> {
    const result = await this.uploadAdminService.uploadMediaVideoLink(dto, admin.userId);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @Get('getAllFile')
  @HttpCode(HttpStatus.OK)
  async getAll(): Promise<IFileUpload[]> {
    const result = await this.uploadAdminService.getAllFile();
    return result;
  }

  @Get('getAllMediaAudioFile')
  @HttpCode(HttpStatus.OK)
  async getAllMediaAudioFile(): Promise<IFileUpload[]> {
    const result = await this.uploadAdminService.getAllMediaAudioFile();
    return result;
  }

  @Get('getAllMediaVideoLink')
  @HttpCode(HttpStatus.OK)
  async getAllMediaVideoLink(): Promise<IFileUpload[]> {
    const result = await this.uploadAdminService.getAllMediaVideoLink();
    return result;
  }

  @Get('getFileAudio/:seq')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'seq', type: Number })
  async getFileAudio(@Param('seq') seq: number): Promise<IAudioFreePay | null> {
    const result = await this.uploadAdminService.getFileAudio(seq);
    return result;
  }

  @Delete('deleteVideoLink/:seq')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'seq', type: Number })
  async deleteVideoLink(@Param('seq') seq: number): Promise<number> {
    const result = await this.uploadAdminService.deleteVideoLink(seq);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

   @Delete('deleteMediaVideoLink/:seq')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'seq', type: Number })
  async deleteMediaVideoLink(@Param('seq') seq: number): Promise<number> {
    const result = await this.uploadAdminService.deleteMediaVideoLink(seq);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }


  @Delete('deleteAudio/:seq')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'seq', type: Number })
  async deleteAudio(@Param('seq') seq: number): Promise<number> {
    const result = await this.uploadAdminService.deleteAudio(seq);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @Delete('deleteMediaAudio/:seq')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'seq', type: Number })
  async deleteMediaAudio(@Param('seq') seq: number): Promise<number> {
    const result = await this.uploadAdminService.deleteMediaAudio(seq);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
  @Delete('deleteImg/:seq')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'seq', type: Number })
  async deleteImg(@Param('seq') seq: number): Promise<number> {
    const result = await this.uploadAdminService.deleteImg(seq);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
}
