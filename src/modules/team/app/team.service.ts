import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { IList, YnEnum } from 'src/interfaces/admin.interface';
import { TeamAppRepository } from './team.repository';
import { GetAllTeamDto, GetReviewListOfTeamDto } from './team.dto';
import { GetAllTeamResDto, GetDetailTeamResDto, GetReviewListOfTeamResDto } from './team.response';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { PagingDto } from 'src/dto/admin.dto';

@Injectable()
export class TeamAppService {
  private readonly SERVICE_NAME = 'TeamAppService';

  constructor(
    private readonly teamAppRepository: TeamAppRepository,
    private readonly fileLocalService: FileLocalService,
    private readonly logger: LoggingService,
  ) {}
  // TODO: TEAM
  async getAllTeams(dto: GetAllTeamDto, userCode: string): Promise<IList<GetAllTeamResDto>> {
    const logbase = `${this.SERVICE_NAME}/getAll:`;
    const total = await this.teamAppRepository.getTotalTeams(dto, userCode);
    const list = await this.teamAppRepository.getAllTeams(dto, userCode);
    this.logger.log(logbase, `total(${total})`);
    return { total, list };
  }

  async getDetailTeam(teamCode: string): Promise<GetDetailTeamResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getDetailTeam:`;
    const result = await this.teamAppRepository.getDetailTeam(teamCode);
    if (!result || !result.teamImages?.length) {
      return result;
    }

    // Duyệt qua từng ảnh để thêm width, height
    for (const img of result.teamImages) {
      const dimensions = await this.fileLocalService.getImageDimensions(img.filename);
      if (dimensions) {
        img.width = dimensions.width;
        img.height = dimensions.height;
      } else {
        img.width = 0;
        img.height = 0;
      }
    }
    this.logger.log(logbase, `homeName(${result.teamName})`);
    return result;
  }

  // TODO: REVIEW
  async getReviewListOfTeam(dto: GetReviewListOfTeamDto): Promise<IList<GetReviewListOfTeamResDto>> {
    const logbase = `${this.SERVICE_NAME}/getAll:`;
    const total = await this.teamAppRepository.getReviewTotalOfTeam(dto);
    const list = await this.teamAppRepository.getReviewListOfTeam(dto);
    this.logger.log(logbase, `total(${total})`);

    return { total: total, list: list };
  }
}
