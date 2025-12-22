import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { IAudioFreePay, IFileMedia, IFileUpload } from '../upload.interface';
import { LoggingService } from 'src/common/logger/logger.service';
import { GetAllMediaDto } from './upload.dto';
import { UploadAppRepository } from './upload.repository';
import { IListApp } from 'src/interfaces/app.interface';
import { AuthAppService } from 'src/modules/auth/app/auth.service';
import { YnEnum } from 'src/interfaces/admin.interface';

@Injectable()
export class UploadAppService {
  private readonly SERVICE_NAME = 'UploadAppService';

  constructor(
    private readonly uploadAppRepository: UploadAppRepository,
    private readonly authAppService: AuthAppService,
    private readonly logger: LoggingService,
  ) {}

  //*media
  async getAllMedia(dto: GetAllMediaDto, userCode: string): Promise<IListApp<IFileMedia>> {
    let list: IFileMedia[] = [];
    const userPackageInfo = await this.authAppService.getInfo(userCode);

    const isUpgrade = userPackageInfo?.packageCode && userPackageInfo.packageRemainDay > 0 ? 'UPGRADE' : 'NOT_UPGRADE';
    console.log("isUpgrade --->", isUpgrade);
    if (dto.mediaType == 'AUDIO') {
      const audioList = await this.uploadAppRepository.getAllMediaAudio(dto);
      for (const file of audioList) {
        // user đã cập nhập gói
        if (isUpgrade === 'UPGRADE') {
          // -> hiện file full
          if (file.isFree === 'Y') {
            list.push((({ isCoupleFree, isFree, ...rest }) => rest)({...file, isCanBeDownload: "Y"})); // BỎ  isCoupleFree
          }
        }
        // user chưa  cập nhập gói
        else if (isUpgrade === 'NOT_UPGRADE') {
          //  files là miễn phí
          if (file.isCoupleFree == 'Y') {
            if (file.isFree == 'N') {
              // -> hiện file full
              list.push((({ isCoupleFree, isFree, ...rest }) => rest)({...file, isCanBeDownload: "Y"}));  // BỎ  isCoupleFree
            }
          }
          //  files là tính phí
          else if (file.isCoupleFree == 'N') {
            if (file.isFree == 'Y') {
              // -> hiện file demo
              list.push((({ isCoupleFree, isFree, ...rest }) => rest)({...file, isCanBeDownload: "N"}));  // BỎ  isCoupleFree
            }
          }
        }
      }
    }
    if (dto.mediaType == 'VIDEO') {
      list = await this.uploadAppRepository.getAllMediaVideo(dto);
      list = list.map((file) => {
        return { ...file, isCanBeDownload: 'N' }; // chỉ audio có chức năng download
      });
    }
    const total = await this.uploadAppRepository.getTotalMedia(dto.mediaType);

    return {
      total: total > 0 && dto.mediaType === 'AUDIO' ? total / 2 : total,
      list,
    };
  }
  //*upload-editor
  async getAllAudioFile(): Promise<IFileUpload[]> {
    const audios = await this.uploadAppRepository.getAllAudioFile();
    return audios;
  }
}
