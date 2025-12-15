import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { IAudioFreePay, IFileMedia, IFileUpload } from '../upload.interface';
import { LoggingService } from 'src/common/logger/logger.service';
import { GetAllMediaDto } from './upload.dto';
import { UploadAppRepository } from './upload.repository';
import { IListApp } from 'src/interfaces/app.interface';

@Injectable()
export class UploadAppService {
  private readonly SERVICE_NAME = 'UploadAppService';

  constructor(
    private readonly uploadAppRepository: UploadAppRepository,
    private readonly logger: LoggingService,
  ) {}

  //*media
  async getAllMedia(dto: GetAllMediaDto, userCode: string): Promise<IListApp<IFileMedia>> {
    let list: IFileMedia[] = [];
    if (dto.mediaType == 'AUDIO') {
      list = await this.uploadAppRepository.getAllMediaAudio(dto);
    }
    if (dto.mediaType == 'VIDEO') {
      list = await this.uploadAppRepository.getAllMediaVideo(dto);
    }
    const total = await this.uploadAppRepository.getTotalMedia(dto.mediaType);

    return { total, list };
  }
  //*upload-editor
  async getAllAudioFile(): Promise<IFileUpload[]> {
    const audios = await this.uploadAppRepository.getAllAudioFile();
    return audios;
  }
}
