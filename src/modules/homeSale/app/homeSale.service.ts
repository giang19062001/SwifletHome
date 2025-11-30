import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { IHomeSale, IHomeSaleImg } from '../homeSale.interface';
import { HomeSaleAppRepository } from './homeSale.repository';
import { IListApp } from 'src/interfaces/app.interface';
import { CreateHomeSightSeeingDto } from './homeSale.dto';
import { Msg } from 'src/helpers/message.helper';
import { OptionService } from 'src/modules/options/option.service';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';

@Injectable()
export class HomeSaleAppService {
  constructor(
    private readonly homeSaleAppRepository: HomeSaleAppRepository,
    private readonly fileLocalService: FileLocalService,
    private readonly optionService: OptionService,
  ) {}
  async getAll(dto: PagingDto): Promise<IListApp<IHomeSale>> {
    const total = await this.homeSaleAppRepository.getTotal();
    const list = await this.homeSaleAppRepository.getAll(dto);
    return { limit: dto.limit, page: dto.page, total, list };
  }
  async getDetail(homeCode: string): Promise<IHomeSale | null> {
    const result = await this.homeSaleAppRepository.getDetail(homeCode);
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

    return result;
  }
  // TODO: SIGHTSEEING
  async registerSightSeeing(dto: CreateHomeSightSeeingDto, userCode: string): Promise<number> {
    // kiểm tra homeCode
    const home = await this.homeSaleAppRepository.getDetail(dto.homeCode);
    if (!home) {
      throw new BadRequestException(Msg.HomeNotFound);
    }
    // kiểm tra attendCode
    const attendCodes = await this.optionService.getAll({
      mainOption: 'SIGHTSEEING',
      subOption: 'NUMBER_ATTEND',
    });
    if (!attendCodes.length) {
      throw new BadRequestException();
    }
    if (!attendCodes.map((c) => c.code).includes(dto.numberAttendCode)) {
      throw new BadRequestException(Msg.CodeInvalid);
    }
    // mặc định status ban đầu là 'WAITING' -> Đang chờ duyệt

    const result = await this.homeSaleAppRepository.registerSightSeeing(dto, userCode, 'WAITING');
    return result;
  }
}
