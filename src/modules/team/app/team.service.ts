import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { IList, YnEnum } from 'src/interfaces/admin.interface';
import { TeamAppRepository } from './team.repository';
import { GetAllTeamDto } from './team.dto';
import { GetAllTeamResDto } from './team.response';

@Injectable()
export class TeamAppService {
  private readonly SERVICE_NAME = 'TeamAppService';

  constructor(
    private readonly teamAppRepository: TeamAppRepository,
    private readonly logger: LoggingService,
  ) {}
  async getAll(dto: GetAllTeamDto): Promise<IList<GetAllTeamResDto>> {
    const logbase = `${this.SERVICE_NAME}/getAll:`;
    const total = await this.teamAppRepository.getTotalTeams(dto);
    const list = await this.teamAppRepository.getAllTeams(dto);
    this.logger.log(logbase, `total(${total})`);
    return { total, list };
  }

}
