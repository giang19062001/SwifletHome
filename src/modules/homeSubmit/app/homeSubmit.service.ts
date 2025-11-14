import { BadRequestException, Injectable } from '@nestjs/common';
import { HomeSubmitAppRepository } from './homeSubmit.repository';
import { CreateHomeSubmitDto } from './homeSubmit.dto';
import { UserAppService } from 'src/modules/user/app/user.service';
import { Msg } from 'src/helpers/message';
import { HomeAppService } from 'src/modules/home/app/home.service';
import { CodeService } from 'src/modules/code/code.service';

@Injectable()
export class HomeSubmitAppService {
  constructor(
    private readonly homeSubmitAppRepository: HomeSubmitAppRepository,
    private readonly homeAppService: HomeAppService,
    private readonly userAppService: UserAppService,
    private readonly codeService: CodeService,
  ) {}
  async create(dto: CreateHomeSubmitDto): Promise<number> {
    const user = await this.userAppService.findByCode(dto.userCode);
    if (!user) {
      throw new BadRequestException(Msg.UserNotFound);
    }
    const home = await this.homeAppService.getDetail(dto.homeCode);
    if (!home) {
      throw new BadRequestException(Msg.HomeNotFound);
    }
    const codes = await this.codeService.getAll({ mainCode: 'SUBMIT', subCode: 'NUMBER_ATTEND' });
    if (!codes.length) {
      throw new BadRequestException();
    }
    if (!codes.map((c) => c.code).includes(dto.numberAttendCode)) {
      throw new BadRequestException(Msg.CodeInvalid);
    }

    const result = await this.homeSubmitAppRepository.create(dto);
    return 1;
  }
}
