import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { GetAllTeamDto} from './team.dto';
import { GetAllTeamResDto, GetDetailTeamResDto } from './team.response';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { OptionService } from 'src/modules/options/option.service';
import { OPTION_CONST } from 'src/modules/options/option.interface';
import { TeamUserAppRepository } from './team-user.repository';

@Injectable()
export class TeamUserAppService {
  private readonly SERVICE_NAME = 'TeamUserAppService';

  constructor(
    private readonly teamUserAppRepository: TeamUserAppRepository,
    private readonly optionService: OptionService,
    private readonly fileLocalService: FileLocalService,
    private readonly logger: LoggingService,
  ) {}
  // TODO: TEAM
  async getAllTeams(dto: GetAllTeamDto, userCode: string): Promise<{ total: number; list: GetAllTeamResDto[] }> {
    const logbase = `${this.SERVICE_NAME}/getAll:`;
    const total = await this.teamUserAppRepository.getTotalTeams(dto, userCode);
    const list = await this.teamUserAppRepository.getAllTeams(dto, userCode);
    this.logger.log(logbase, `total(${total})`);
    return { total, list };
  }

  async getDetailTeam(teamCode: string): Promise<GetDetailTeamResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getDetailTeam:`;
    let result = await this.teamUserAppRepository.getDetailTeam(teamCode);

    if (!result || !result.teamImages?.length) {
      return result;
    }

    // lấy option và handle teamDescriptionSpecial trả ra { text, value}
    const technicalTypes = await this.optionService.getAll({
      mainOption: OPTION_CONST.USER_TEAM.TECHNICAL_TYPE.mainOption,
      subOption: OPTION_CONST.USER_TEAM.TECHNICAL_TYPE.subOption,
    });
    if (result.teamDescriptionSpecial !== null) {
      const optionMap = Object.fromEntries(technicalTypes.map((o) => [o.keyOption.toLowerCase(), o.valueOption]));
      result.teamDescriptionSpecial = Object.fromEntries(
        Object.entries(result.teamDescriptionSpecial).map(([key, value]) => [
          key,
          {
            text: optionMap[key],
            value,
          },
        ]),
      );
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
}
