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
    // nếu đã nâng cấp gói hoặc chưa hết hạn -> có thể xem được audio ko miễn phí
    // nếu chưa nâng cấp gói hoặc hết hạn -> chỉ xem được ~ audio miễn phí

    const isFree = userPackageInfo?.packageCode && userPackageInfo.packageRemainDay > 0 ? YnEnum.N : YnEnum.Y;
    // nếu đã nâng cấp gói hoặc chưa hết hạn -> có thể download audio
    // nếu chưa nâng cấp gói hoặc hết hạn -> ko  thể download audio
    const isCanBeDownload = userPackageInfo?.packageCode && userPackageInfo.packageRemainDay > 0 ? YnEnum.Y : YnEnum.N;
    if (dto.mediaType == 'AUDIO') {
      list = await this.uploadAppRepository.getAllMediaAudio(dto, isFree);
      list = list.map((ele) => {
        return { ...ele, isCanBeDownload: isCanBeDownload };
      });
    }
    if (dto.mediaType == 'VIDEO') {
      list = await this.uploadAppRepository.getAllMediaVideo(dto);
      list = list.map((ele) => {
        return { ...ele, isCanBeDownload: 'N' }; // chỉ audio có chức năng download
      });
    }
    const total = await this.uploadAppRepository.getTotalMedia(dto.mediaType, isFree);

    return { total, list };
  }
  //*upload-editor
  async getAllAudioFile(): Promise<IFileUpload[]> {
    const audios = await this.uploadAppRepository.getAllAudioFile();
    return audios;
  }
}
