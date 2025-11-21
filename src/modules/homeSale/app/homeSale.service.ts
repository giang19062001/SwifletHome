import { UploadService } from '../../upload/upload.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { IHomeSale, IHomeSaleImg } from '../homeSale.interface';
import { HomeSaleAppRepository } from './homeSale.repository';
import { IListApp } from 'src/interfaces/app.interface';
import { CreateHomeSubmitDto } from './homeSubmit.dto';
import { Msg } from 'src/helpers/message.helper';
import { OptionService } from 'src/modules/options/option.service';

@Injectable()
export class HomeSaleAppService {
  constructor(
    private readonly homeSaleAppRepository: HomeSaleAppRepository,
    private readonly optionService: OptionService,
  ) {}
  async getAll(dto: PagingDto): Promise<IListApp<IHomeSale>> {
    const total = await this.homeSaleAppRepository.getTotal();
    const list = await this.homeSaleAppRepository.getAll(dto);
    return { limit: dto.limit, page: dto.page, total, list };
  }
  async getDetail(homeCode: string): Promise<IHomeSale | null> {
    const result = await this.homeSaleAppRepository.getDetail(homeCode);
    return result;
  }
  // TODO: SUBMIT 
  async createSubmit(dto: CreateHomeSubmitDto, userCode: string): Promise<number> {
    // kiểm tra homeCode
    const home = await this.homeSaleAppRepository.getDetail(dto.homeCode);
    if (!home) {
      throw new BadRequestException(Msg.HomeNotFound);
    }
    // kiểm tra attendCode
    const attendCodes = await this.optionService.getAll({
      mainOption: 'SUBMIT',
      subOption: 'NUMBER_ATTEND',
    });
    if (!attendCodes.length) {
      throw new BadRequestException();
    }
    if (!attendCodes.map((c) => c.code).includes(dto.numberAttendCode)) {
      throw new BadRequestException(Msg.CodeInvalid);
    }
    // lấy statusCode -> Đang chờ duyệt
    const statusCodes = await this.optionService.getAll({
      mainOption: 'SUBMIT',
      subOption: 'STATUS',
      keyOption: 'WAITING',
    });
    if (!statusCodes.length) {
      throw new BadRequestException();
    }

    const result = await this.homeSaleAppRepository.createSubmit(dto, userCode, statusCodes[0].code);
    return result;
  }
}
