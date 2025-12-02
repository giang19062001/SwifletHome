import { UploadService } from '../../upload/upload.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { getFileLocation } from 'src/config/multer.config';
import { LoggingService } from 'src/common/logger/logger.service';
import { IUserHome, IUserHomeImageStr } from '../userHome.interface';
import { MutationUserHomeDto, UploadUserHomeImageDto } from './userHome.dto';
import { UserHomeAppRepository } from './userHome.repository';
import { PagingDto } from 'src/dto/admin.dto';
import { IList, YnEnum } from 'src/interfaces/admin.interface';
import { Msg } from 'src/helpers/message.helper';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { UserAppRepository } from 'src/modules/user/app/user.repository';

@Injectable()
export class UserHomeAppService {
  private readonly SERVICE_NAME = 'UserHomeAppService';

  constructor(
    private readonly userHomeAppRepository: UserHomeAppRepository,
    private readonly userAppRepository: UserAppRepository,
    private readonly fileLocalService: FileLocalService,
    private readonly logger: LoggingService,
  ) {}
  async getAll(dto: PagingDto, userCode: string): Promise<IList<IUserHome>> {
    const total = await this.userHomeAppRepository.getTotalHomes(userCode);
    const list = await this.userHomeAppRepository.getAllHomes(dto, userCode);
    return { total, list };
  }

  async getDetail(userHomeCode: string): Promise<IUserHome | null> {
    const result = await this.userHomeAppRepository.getDetailHome(userHomeCode);
    return result;
  }

  async getMainHomeByUser(userCode: string): Promise<IUserHome | null> {
    const result = await this.userHomeAppRepository.getMainHomeByUser(userCode);
    return result;
  }
  async updateHomeToMain(userHomeCode: string, userCode: string): Promise<number> {
    const homeMain = await this.userHomeAppRepository.getMainHomeByUser(userCode);
    // cập nhập nhà yến đang nhà chính hiện tại thành phụ
    if (homeMain && homeMain.userHomeCode !== userHomeCode) {
      await this.userHomeAppRepository.updateHomeMain(YnEnum.N, userCode, homeMain.userHomeCode);
    }
    // cập nhập nhà yến != userHomeCode với nhà yến đang là chính -> để thành nhà yến chính
    const result = await this.userHomeAppRepository.updateHomeMain(YnEnum.Y, userCode, userHomeCode);
    return result;
  }

  async delete(userHomeCode: string, userCode: string): Promise<number> {
    const homeMain = await this.userHomeAppRepository.getMainHomeByUser(userCode);
    // nếu nhà yến muốn xóa đang là chính -> ko thể xóa
    if (homeMain && homeMain.userHomeCode == userHomeCode) {
      throw new BadRequestException({ message: Msg.HomeIsMainCannotDelete, data: 0 });
    }

    const result = await this.userHomeAppRepository.delete(userHomeCode, userCode);
    return result;
  }
  async update(userCode: string, userHomeCode: string, dto: MutationUserHomeDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/update:`;

    try {
      let result = 1;
      const home = await this.userHomeAppRepository.getDetailHome(userHomeCode);
      // nếu uuid khác nhau -> có sự upload ảnh home mới
      if (home) {
        //  cập nhập dữ liệu, ảnh
        if (home.uniqueId != dto.uniqueId) {
          // kiểm tra xem với uuid này có thật sự đã có file mới upload vào database hay không
          const filesUploaded = await this.userHomeAppRepository.findFilesByUniqueId(dto.uniqueId);
          if (filesUploaded) {
            // xóa ảnh hiện tại trong local
            await this.fileLocalService.deleteLocalFile(home.userHomeImage);

            // xóa ảnh hiện tại trong database
            await this.userHomeAppRepository.deleteFileByUniqueid(home.uniqueId);

            // cập nhập -> cập nhập dữ liệu và ảnh mới
            const userHomeImagePath = `${getFileLocation(filesUploaded.mimetype, filesUploaded.filename)}/${filesUploaded.filename}`;
            await this.userHomeAppRepository.update(userCode, userHomeCode, dto, userHomeImagePath);

            // cập nhập userHomeSEQ của file mới đã cùng uniqueId với nhà yến vừa updated
            await this.userHomeAppRepository.updateSeqFiles(home.seq, filesUploaded.seq, dto.uniqueId);
          } else {
            throw new BadRequestException();
          }
        } else {
          // cập nhập dữ liệu -> ảnh vẫn giữ nguyên
          await this.userHomeAppRepository.update(userCode, userHomeCode, dto, home.userHomeImage);
        }
      } else {
        throw new BadRequestException();
      }

      return result;
    } catch (error) {
      this.logger.error(logbase, error);
      return 0;
    }
  }
  async create(userCode: string, dto: MutationUserHomeDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/create:`;

    try {
      let result = 1;

      // lấy tất cả home của user
      const homesTotal = await this.userHomeAppRepository.getTotalHomes(userCode);
      const userPackage = await this.userAppRepository.getUserPackageInfo(userCode);
      // nếu user xài gói miễn phí và đã có 1 nhà yến rồi -> ko thể thêm nữa trừ khi nâng cập
      if (homesTotal == 1 && userPackage?.packageCode == null) {
        result = -2;
        return result;
      }
      // tìm file đã upload cùng uniqueId
      const filesUploaded = await this.userHomeAppRepository.findFilesByUniqueId(dto.uniqueId);
      // có file được upload cùng uuid -> insert
      if (filesUploaded) {
        // thêm nhà yến của user
        const userHomeImagePath = `${getFileLocation(filesUploaded.mimetype, filesUploaded.filename)}/${filesUploaded.filename}`;
        // kiểm tra user này có nhà nào là chính hay chưa
        const homeMain = await this.userHomeAppRepository.getMainHomeByUser(userCode);
        let isMain = 'N';
        if (!homeMain) {
          isMain = 'Y';
        }
        const seq = await this.userHomeAppRepository.create(userCode, dto, isMain, userHomeImagePath);
        // cập nhập userHomeSEQ của file đã tìm cùng uniqueId với nhà yến vừa created
        await this.userHomeAppRepository.updateSeqFiles(seq, filesUploaded.seq, dto.uniqueId);
      } else {
        // không có file ảnh nào được upload của nhà yến này -> báo lỗi
        result = -1;
        return result;
      }

      return result;
    } catch (error) {
      this.logger.error(logbase, error);
      return 0;
    }
  }
  async uploadHomeImage(userCode: string, dto: UploadUserHomeImageDto, userHomeImageFile: Express.Multer.File): Promise<IUserHomeImageStr> {
    const logbase = `${this.SERVICE_NAME}/uploadHomeImage:`;
    try {
      let res: IUserHomeImageStr = { filename: '' };
      if (userHomeImageFile) {
        const filenamePath = `${getFileLocation(userHomeImageFile.mimetype, userHomeImageFile.fieldname)}/${userHomeImageFile.filename}`;
        const result = await this.userHomeAppRepository.uploadHomeImage(0, dto.uniqueId, userCode, filenamePath, userHomeImageFile);
        if (result > 0) {
          res.filename = `${location}/${userHomeImageFile.filename}`;
        }
      }
      return res;
    } catch (error) {
      // this.logger.error(logbase, error);
      console.log("error", error);
      return { filename: '' };
    }
  }
}
