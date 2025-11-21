import { BadRequestException, Injectable } from '@nestjs/common';
import { HomeSubmitAppRepository } from './homeSubmit.repository';
import { CreateHomeSubmitDto } from './homeSubmit.dto';
import { UserAppService } from 'src/modules/user/app/user.service';
import { Msg } from 'src/helpers/message.helper';
import { HomeSaleAppService } from 'src/modules/homeSale/app/homeSale.service';
import { CodeService } from 'src/modules/code/code.service';

@Injectable()
export class HomeSubmitAppService {
  constructor(
    private readonly homeSubmitAppRepository: HomeSubmitAppRepository,
    private readonly homeAppService: HomeSaleAppService,
    private readonly codeService: CodeService,
  ) {}
  async create(dto: CreateHomeSubmitDto, userCode: string): Promise<number> {
    // kiểm tra homeCode
    const home = await this.homeAppService.getDetail(dto.homeCode);
    if (!home) {
      throw new BadRequestException(Msg.HomeNotFound);
    }
    // kiểm tra attendCode
    const attendCodes = await this.codeService.getAll({
      mainCode: 'SUBMIT',
      subCode: 'NUMBER_ATTEND',
    });
    if (!attendCodes.length) {
      throw new BadRequestException();
    }
    if (!attendCodes.map((c) => c.code).includes(dto.numberAttendCode)) {
      throw new BadRequestException(Msg.CodeInvalid);
    }
    // lấy statusCode -> Đang chờ duyệt
    const statusCodes = await this.codeService.getAll({
      mainCode: 'SUBMIT',
      subCode: 'STATUS',
      keyCode: 'WAITING',
    });
    if (!statusCodes.length) {
      throw new BadRequestException();
    }

    const result = await this.homeSubmitAppRepository.create(dto, userCode, statusCodes[0].code);
    return result;
  }
}
