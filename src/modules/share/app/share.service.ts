import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { TodoHarvestAppService } from 'src/modules/todo/app/todo-harvest.service';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { GetShareLinkDto } from './share.dto';
import { ShareTypeEnum } from './share.enum';
import { ShareAppRepository } from './share.repository';
import { GetShareDataResDto } from './share.response';

@Injectable()
export class ShareAppService {
  constructor(
    private readonly shareRepository: ShareAppRepository,
    private readonly configService: ConfigService,
    private readonly todoHarvestAppService: TodoHarvestAppService,
    private readonly userHomeAppService: UserHomeAppService,
  ) {}

  async getShareLink(dto: GetShareLinkDto): Promise<string | null> {
    const { seq, userHomeCode, harvestPhase, harvestYear } = dto;

    const isExistHarvestPhase = await this.shareRepository.checkHarvestPhaseExist(seq, userHomeCode, harvestPhase, harvestYear);
    if (!isExistHarvestPhase) return null;

    const host = this.configService.get<string>('SHARE_ORIGINS');
    if (!host) return null;

    const existing = await this.shareRepository.getShareByDetails(seq, ShareTypeEnum.HARVEST);
    if (existing) {
      return `${host}/sharelink/${existing.shareToken}`;
    }

    const token = randomUUID().replace(/-/g, '');
    await this.shareRepository.insertShare(token, seq, ShareTypeEnum.HARVEST);

    return `${host}/sharelink/${token}`;
  }

  async getShareData(token: string): Promise<GetShareDataResDto> {
    const shareMaster = await this.shareRepository.getShareByToken(token);
    if (!shareMaster) {
      throw new BadRequestException({ message: 'Token không hợp lệ hoặc đã hết hạn', data: null });
    }

    switch (shareMaster.shareType) {
      case ShareTypeEnum.HARVEST: {
        const harvestPhaseDetail = await this.shareRepository.getHarvestPhaseBySeq(shareMaster.seqShare);
        if (!harvestPhaseDetail) {
          throw new BadRequestException({ message: 'Dữ liệu thu hoạch không còn tồn tại', data: null });
        }

        const homeData = await this.userHomeAppService.getDetail(harvestPhaseDetail.userHomeCode);
        if (!homeData) {
          throw new BadRequestException({ message: 'Không tìm thấy thông tin nhà yến', data: null });
        }

        const { isIntegateTempHum, isIntegateCurrent, isTriggered, uniqueId, ...cleanHomeData } = homeData;

        const harvestData = await this.todoHarvestAppService.arrangeHarvestRows(harvestPhaseDetail.seq, homeData.userHomeFloor);

        return {
          shareType: shareMaster.shareType,
          shareData: {
            seq: harvestPhaseDetail.seq,
            harvestPhase: harvestPhaseDetail.harvestPhase,
            harvestYear: harvestPhaseDetail.harvestYear,
            userHomeCode: harvestPhaseDetail.userHomeCode,
            homeData: cleanHomeData,
            harvestData,
          },
        };
      }

      default:
        throw new BadRequestException({ message: 'Loại chia sẻ không được hỗ trợ', data: null });
    }
  }
}
