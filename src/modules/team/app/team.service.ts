import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { IList, YnEnum } from 'src/interfaces/admin.interface';
import { TeamAppRepository } from './team.repository';
import { GetAllTeamDto, GetReviewListOfTeamDto, ReviewTeamDto, UploadReviewFilesDto } from './team.dto';
import { GetAllTeamResDto, GetDetailTeamResDto, GetReviewListOfTeamResDto } from './team.response';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { PagingDto } from 'src/dto/admin.dto';
import { OptionService } from 'src/modules/options/option.service';
import { OPTION_CONST } from 'src/modules/options/option.interface';
import { getFileLocation } from 'src/config/multer.config';
import { ITeamReviewFileStr } from './team.interface';
import { Msg } from 'src/helpers/message.helper';

@Injectable()
export class TeamAppService {
  private readonly SERVICE_NAME = 'TeamAppService';

  constructor(
    private readonly teamAppRepository: TeamAppRepository,
    private readonly optionService: OptionService,
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
    let result = await this.teamAppRepository.getDetailTeam(teamCode);

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

  // TODO: REVIEW
  async getReviewListOfTeam(dto: GetReviewListOfTeamDto): Promise<IList<GetReviewListOfTeamResDto>> {
    const logbase = `${this.SERVICE_NAME}/getAll:`;
    const total = await this.teamAppRepository.getReviewTotalOfTeam(dto);
    const list = await this.teamAppRepository.getReviewListOfTeam(dto);
    this.logger.log(logbase, `total(${total})`);

    return { total: total, list: list };
  }

  async reviewTeam(userCode: string, dto: ReviewTeamDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/requestDoctor:`;

    try {
      let result = 1;

      // kiểm tra teamCode
      const isValidTeam = await this.teamAppRepository.findTeamByCode(dto.teamCode);
      if (!isValidTeam) {
        result = -2;
        this.logger.error(logbase, `${Msg.TeamNotFound} --> teamCode: ${dto.teamCode}`);
        return result;
      }

      // tìm tất cả file đã upload cùng uniqueId
      const filesUploaded: { seq: number }[] = await this.teamAppRepository.findFilesByUniqueId(dto.uniqueId, dto.teamCode);

      if (filesUploaded.length) {
        // mặc định là chờ
        const seq = await this.teamAppRepository.insertReview(userCode, dto);
        for (const file of filesUploaded) {
          // cập nhập reviewSeq của các file đã tìm cùng uniqueId
          await this.teamAppRepository.updateSeqFiles(seq, file.seq, dto.uniqueId, userCode);
        }
      } else {
        // không có file ảnh nào được upload của đơn khám bệnh này -> báo lỗi
        result = -1;
        this.logger.error(logbase, `${Msg.UuidNotFound} --> uniqueId: ${dto.uniqueId}`);
      }

      if (result == 1) {
        this.logger.log(logbase, `Đăng ký khám bệnh thành công: ${JSON.stringify(dto)}`);
      }
      return result;
    } catch (error) {
      this.logger.error(logbase, JSON.stringify(error));
      return 0;
    }
  }

  async uploadReviewFiles(userCode: string, dto: UploadReviewFilesDto, reviewImgs: Express.Multer.File[]): Promise<ITeamReviewFileStr[]> {
    const logbase = `${this.SERVICE_NAME}/uploadFile:`;
    try {
      // kiểm tra teamCode
      const isValidTeam = await this.teamAppRepository.findTeamByCode(dto.teamCode);
      if (!isValidTeam) {
        throw new BadRequestException({
          message: Msg.TeamNotFound,
          data: [],
        });
      }
      // upload
      let res: ITeamReviewFileStr[] = [];
      if (reviewImgs.length > 0) {
        for (const file of reviewImgs) {
          this.logger.log(logbase, `Đang Upload file.. ${JSON.stringify(file)}`);

          const filenamePath = `${getFileLocation(file.mimetype, file.fieldname)}/${file.filename}`;
          const insertId = await this.teamAppRepository.uploadFile(0, dto.uniqueId, dto.teamCode, userCode, filenamePath, file);
          if (insertId > 0) {
            res.push({
              seq: insertId,
              filename: filenamePath,
            });
          }
        }
      }
      this.logger.log(logbase, `Upload file thành công: ${JSON.stringify(res)}`);
      return res;
    } catch (error) {
      this.logger.error(logbase, `Upload file thất bại: ${JSON.stringify(error)}`);
      throw error;
    }
  }
}
