import { BadRequestException, Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { getFileLocation } from 'src/config/multer.config';
import { Msg } from 'src/helpers/message.helper';
import { TeamReviewAppRepository } from './team-review.repository';
import { TeamUserAppRepository } from './team-user.repository';
import { GetReviewListOfTeamDto, ReviewTeamDto, TeamReviewFileStrResDto, UploadReviewFilesDto } from './team.dto';
import { GetReviewListOfTeamResDto } from './team.response';

@Injectable()
export class TeamReviewAppService {
  private readonly SERVICE_NAME = 'TeamReviewAppService';
  constructor(
    private readonly teamReviewAppRepository: TeamReviewAppRepository,
    private readonly teamUserAppRepository: TeamUserAppRepository,
    private readonly logger: LoggingService,
  ) {}
  // TODO: REVIEW
  async getReviewListOfTeam(dto: GetReviewListOfTeamDto): Promise<{ total: number; list: GetReviewListOfTeamResDto[] }> {
    const logbase = `${this.SERVICE_NAME}/getAll:`;
    const total = await this.teamReviewAppRepository.getReviewTotalOfTeam(dto);
    const list = await this.teamReviewAppRepository.getReviewListOfTeam(dto);
    this.logger.log(logbase, `total(${total})`);

    return { total: total, list: list };
  }

  async reviewTeam(userCode: string, dto: ReviewTeamDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/requestDoctor:`;

    try {
      let result = 1;

      // kiểm tra teamCode
      const isValidTeam = await this.teamUserAppRepository.findTeamByCode(dto.teamCode);
      if (!isValidTeam) {
        result = -2;
        this.logger.error(logbase, `${Msg.TeamNotFound} --> teamCode: ${dto.teamCode}`);
        return result;
      }

      // kiểm tra teamCode
      const isDupcateReview = await this.teamReviewAppRepository.checkDuplicateReview(dto.teamCode, userCode);
      if (isDupcateReview) {
        result = -3;
        this.logger.error(logbase, `${Msg.YouAlreadyReview} --> teamCode: ${dto.teamCode}`);
        return result;
      }

      // tìm tất cả file đã upload cùng uniqueId
      const filesUploaded: { seq: number }[] = await this.teamReviewAppRepository.findFilesByUniqueId(dto.uniqueId, dto.teamCode);
      if (filesUploaded.length) {
        // mặc định là chờ
        const seq = await this.teamReviewAppRepository.insertReview(userCode, dto);
        for (const file of filesUploaded) {
          // cập nhập reviewSeq của các file đã tìm cùng uniqueId
          await this.teamReviewAppRepository.updateSeqFiles(seq, file.seq, dto.uniqueId, userCode);
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

  async uploadReviewFiles(userCode: string, dto: UploadReviewFilesDto, reviewImgs: Express.Multer.File[]): Promise<TeamReviewFileStrResDto[]> {
    const logbase = `${this.SERVICE_NAME}/uploadFile:`;
    try {
      // kiểm tra teamCode
      const isValidTeam = await this.teamUserAppRepository.findTeamByCode(dto.teamCode);
      if (!isValidTeam) {
        throw new BadRequestException({
          message: Msg.TeamNotFound,
          data: [],
        });
      }
      // upload
      let res: TeamReviewFileStrResDto[] = [];
      if (reviewImgs.length > 0) {
        for (const file of reviewImgs) {
          this.logger.log(logbase, `Đang Upload file.. ${JSON.stringify(file)}`);

          const filenamePath = `${getFileLocation(file.mimetype, file.fieldname)}/${file.filename}`;
          const insertId = await this.teamReviewAppRepository.uploadFile(0, dto.uniqueId, dto.teamCode, userCode, filenamePath, file);
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

  async getFilesNotUse() {
    return await this.teamReviewAppRepository.getFilesNotUse();
  }

  async deleteFile(seq: number) {
    return await this.teamReviewAppRepository.deleteFile(seq);
  }
}
