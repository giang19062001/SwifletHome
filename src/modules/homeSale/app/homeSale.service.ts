import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { HomeSaleSightSeeingStatusEnum, IHomeSale, IHomeSaleImg } from '../homeSale.interface';
import { HomeSaleAppRepository } from './homeSale.repository';
import { IListApp } from 'src/interfaces/app.interface';
import { CreateHomeSightSeeingDto } from './homeSale.dto';
import { Msg } from 'src/helpers/message.helper';
import { OptionService } from 'src/modules/options/option.service';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { LoggingService } from 'src/common/logger/logger.service';
import { replaceNbspToSpace } from 'src/helpers/func.helper';

@Injectable()
export class HomeSaleAppService {
  private readonly SERVICE_NAME = 'HomeSaleAppService';

  constructor(
    private readonly homeSaleAppRepository: HomeSaleAppRepository,
    private readonly fileLocalService: FileLocalService,
    private readonly optionService: OptionService,
    private readonly logger: LoggingService,
  ) {}
  async getAll(dto: PagingDto): Promise<IListApp<IHomeSale>> {
    const logbase = `${this.SERVICE_NAME}/getAll:`;

    const total = await this.homeSaleAppRepository.getTotal();
    const list = await this.homeSaleAppRepository.getAll(dto);
    this.logger.log(logbase, `total(${total})`);

    // return { limit: dto.limit, page: dto.page, total, list };
    return { total, list };
  }
  async getDetail(homeCode: string): Promise<IHomeSale | null> {
    const logbase = `${this.SERVICE_NAME}/getDetail:`;

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
    this.logger.log(logbase, `homeName(${result.homeName})`);

    return {...result, homeDescription: replaceNbspToSpace(result.homeDescription)};
  }
  // TODO: SIGHTSEEING
  async registerSightSeeing(dto: CreateHomeSightSeeingDto, userCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/registerSightSeeing:`;

    // kiểm tra homeCode
    const home = await this.homeSaleAppRepository.getDetail(dto.homeCode);
    if (!home) {
      this.logger.error(logbase, `homeCode(${dto.homeCode}) -> ${Msg.HomeNotFound}`);
      throw new BadRequestException({ message: Msg.HomeNotFound, data: 0 });
    }
    // kiểm tra attendCode
    const attendCodes = await this.optionService.getAll({
      mainOption: 'SIGHTSEEING',
      subOption: 'NUMBER_ATTEND',
    });

    if (!attendCodes.map((c) => c.code).includes(dto.numberAttendCode)) {
      throw new BadRequestException({ message: Msg.CodeInvalid, data: 0 });
    }
    // mặc định status ban đầu là  'Đang chờ duyệt'
    const result = await this.homeSaleAppRepository.registerSightSeeing(dto, userCode, HomeSaleSightSeeingStatusEnum.WAITING);
    this.logger.log(logbase, `homeCode(${dto.homeCode}) -> ${result ? Msg.RegisterOk : Msg.RegisterErr}`);

    return result;
  }
}
