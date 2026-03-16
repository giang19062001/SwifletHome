import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { LoggingService } from 'src/common/logger/logger.service';
import { replaceNbspToSpace } from 'src/helpers/func.helper';
import { HomeSaleResDto } from '../homeSale.response';
import { HomeSaleIndexAppRepository } from './homeSale-index.repository';

@Injectable()
export class HomeSaleIndexAppService {
  private readonly SERVICE_NAME = 'HomeSaleIndexAppService';

  constructor(
    private readonly homeSaleIndexAppRepository: HomeSaleIndexAppRepository,
    private readonly fileLocalService: FileLocalService,
    private readonly logger: LoggingService,
  ) {}
  async getAll(dto: PagingDto): Promise<{ total: number; list: HomeSaleResDto[] }> {
    const logbase = `${this.SERVICE_NAME}/getAll:`;

    const total = await this.homeSaleIndexAppRepository.getTotal();
    const list = await this.homeSaleIndexAppRepository.getAll(dto);
    this.logger.log(logbase, `total(${total})`);

    // return { limit: dto.limit, page: dto.page, total, list };
    return { total, list };
  }
  async getDetail(homeCode: string): Promise<HomeSaleResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getDetail:`;

    const result = await this.homeSaleIndexAppRepository.getDetail(homeCode);
    if (!result || !result.homeImages?.length) {
      return result;
    }

    // Duyệt qua từng ảnh để thêm width, height
    for (const img of result.homeImages) {
      const dimensions = await this.fileLocalService.getImageDimensions(img.filename);
      if (dimensions) {
        img.width = dimensions.width;
        img.height = dimensions.height;
      } else {
        img.width = 0;
        img.height = 0;
      }
    }
    this.logger.log(logbase, `homeName(${result.homeName})`);

    return { ...result, homeDescription: replaceNbspToSpace(result.homeDescription) };
  }
}
