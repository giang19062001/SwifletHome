import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { diffByTwoArr } from 'src/helpers/func.helper';
import { LoggingService } from 'src/common/logger/logger.service';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { getFileLocation } from 'src/config/multer.config';
import { TeamAdminRepository } from './team.repository';
import { ChangDisplayReviewDto, CreateTeamDto, UpdateTeamDto, TeamResDto, TeamReviewResDto, TeamImgResDto } from './team.dto';
import { ListResponseDto } from "src/dto/common.dto";

@Injectable()
export class TeamAdminService {
  private readonly SERVICE_NAME = 'TeamAdminService';
  constructor(
    private readonly teamAdminRepository: TeamAdminRepository,
    private readonly fileLocalService: FileLocalService,
    private readonly logger: LoggingService,
  ) {}
  async getAll(dto: PagingDto): Promise<{ total: number; list: TeamResDto[] }> {
    const total = await this.teamAdminRepository.getTotal();
    const list = await this.teamAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(teamCode: string): Promise<TeamResDto | null> {
    let result = await this.teamAdminRepository.getDetail(teamCode);
    if (result) {
      let teamImages = await this.teamAdminRepository.getImages(result ? result?.seq : 0);
      // tách biệt ảnh chính và danh sách ảnh phụ
      let teamImagesExceptMain: TeamImgResDto[] = [];
      for (const img of teamImages) {
        if (img.filename == result.teamImage) {
          result.teamImage = img;
        } else {
          teamImagesExceptMain.push(img);
        }
      }
      result.teamImages = teamImagesExceptMain;
      return result;
    } else {
      return null;
    }
  }
  async create(dto: CreateTeamDto, createdId: string): Promise<number> {
    try {
      // kiểm tra trùng lặp
      const isDuplicate = await this.teamAdminRepository.checkDuplicateTeam(dto.userCode, dto.userTypeCode);
      if (isDuplicate) {
        return -1;
      }
      const teamImagePath = dto.teamImage ? `${getFileLocation(dto.teamImage.mimetype, dto.teamImage.fieldname)}/${dto.teamImage.filename}` : '';
      const seq = await this.teamAdminRepository.create(dto, teamImagePath, createdId);
      if (seq) {
        //teamImage
        if (dto.teamImage) {
          await this.teamAdminRepository.createImages(seq, createdId, teamImagePath, dto.teamImage);
        }
        //teamImages
        if (dto.teamImages.length > 0) {
          for (const file of dto.teamImages) {
            const filenamePath = `${getFileLocation(file.mimetype, file.fieldname)}/${file.filename}`;
            await this.teamAdminRepository.createImages(seq, createdId, filenamePath, file);
          }
        }
      }
      return seq;
    } catch (error) {
      console.log('error', error);
      return 0;
    }
  }

  async update(dto: UpdateTeamDto, updatedId: string, teamCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/update`;

    const home = await this.getDetail(teamCode);
    let teamImagePath = (home?.teamImage as TeamImgResDto).filename;
    if (home) {
      // teamImage bị thay đổi -> xóa ảnh hiện tại của nó
      if (dto.teamImage.filename !== (home.teamImage as TeamImgResDto).filename) {
        // xóa file local
        await this.fileLocalService.deleteLocalFile((home.teamImage as TeamImgResDto).filename);

        // xóa trong db
        await this.teamAdminRepository.deleteHomeImagesOne((home.teamImage as TeamImgResDto).seq);

        // instart file mới vào db
        teamImagePath = `${getFileLocation(dto.teamImage.mimetype, dto.teamImage.fieldname)}/${dto.teamImage.filename}`;
        await this.teamAdminRepository.createImages(home.seq, 'admin', teamImagePath, dto.teamImage);
      }

      const fileNeedDeletes: TeamImgResDto[] = diffByTwoArr(dto.teamImages, home.teamImages, 'filename');
      this.logger.log(logbase, `Danh sách file cần xóa --> ${JSON.stringify(fileNeedDeletes.map((fi) => fi.filename))}`);

      const fileNeedCreates: TeamImgResDto[] = diffByTwoArr(home.teamImages, dto.teamImages, 'filename');
      this.logger.log(logbase, `Danh sách file cần thêm mới --> ${JSON.stringify(fileNeedCreates.map((fi) => fi.filename))}`);

      // teamImages bị thay đổi -> xóa ~ ảnh hiện tại của nó
      if (fileNeedDeletes.length) {
        // xóa ~ file local
        await this.teamAdminRepository.deleteHomeImagesMulti(fileNeedDeletes.map((ele) => ele.seq));
        // xóa ~ trong db
        for (const file of fileNeedDeletes) {
          await this.fileLocalService.deleteLocalFile(file.filename);
        }
      }
      if (fileNeedCreates.length) {
        // instart ~ file mới vào db
        for (const file of fileNeedCreates) {
          const filenamePath = `${getFileLocation(file.mimetype, file.filename)}/${file.filename}`;
          const insertImgResult = await this.teamAdminRepository.createImages(home.seq, 'admin', filenamePath, file);
          this.logger.log(logbase, `Insert file mới --> file(${file.filename}) --> result: ${insertImgResult}`);
        }
      }
      const result = await this.teamAdminRepository.update(dto, teamImagePath, updatedId, teamCode);
      return result;
    } else {
      return 0;
    }
  }
  async delete(teamCode: string): Promise<number> {
    const home = await this.teamAdminRepository.getDetail(teamCode);
    if (home) {
      // const images = await this.teamAdminRepository.getImages(home?.seq ?? 0);
      const resultHome = await this.teamAdminRepository.delete(teamCode);
      return resultHome;
    } else {
      return 0;
    }
  }

  // TODO: REVIEW
  async getAllReview(dto: PagingDto): Promise<{ total: number; list: TeamReviewResDto[] }> {
    const total = await this.teamAdminRepository.getTotalReview();
    const list = await this.teamAdminRepository.getAllReview(dto);
    return { total, list };
  }

  async getDetailReview(seq: number): Promise<TeamReviewResDto | null> {
    const result = await this.teamAdminRepository.getDetailReview(seq);
    return result;
  }

  async changeDisplay(dto: ChangDisplayReviewDto, updatedId: string, seq: number): Promise<number> {
    const result = await this.teamAdminRepository.changeDisplay(dto.isDisplay, updatedId, seq);
    return result;
  }
}
