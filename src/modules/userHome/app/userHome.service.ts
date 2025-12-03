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
    const logbase = `${this.SERVICE_NAME}/getAll:`;
    const total = await this.userHomeAppRepository.getTotalHomes(userCode);
    const list = await this.userHomeAppRepository.getAllHomes(dto, userCode);
    this.logger.log(logbase, `userCode(${userCode})`);
    return { total, list };
  }

  async getDetail(userHomeCode: string): Promise<IUserHome | null> {
    const logbase = `${this.SERVICE_NAME}/getDetail:`;
    const result = await this.userHomeAppRepository.getDetailHome(userHomeCode);
    this.logger.log(logbase, `userHomeCode(${userHomeCode})`);
    return result;
  }

  async getMainHomeByUser(userCode: string): Promise<IUserHome | null> {
    const logbase = `${this.SERVICE_NAME}/getMainHomeByUser:`;
    const result = await this.userHomeAppRepository.getMainHomeByUser(userCode);
    this.logger.log(logbase, `userCode(${userCode})`);
    return result;
  }
  async updateHomeToMain(userHomeCode: string, userCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/updateHomeToMain:`;

    const homeMain = await this.userHomeAppRepository.getMainHomeByUser(userCode);
    // cập nhập nhà yến đang nhà chính hiện tại thành phụ
    if (homeMain && homeMain.userHomeCode !== userHomeCode) {
      await this.userHomeAppRepository.updateHomeMain(YnEnum.N, userCode, homeMain.userHomeCode);
    }
    // cập nhập nhà yến != userHomeCode với nhà yến đang là chính -> để thành nhà yến chính
    const result = await this.userHomeAppRepository.updateHomeMain(YnEnum.Y, userCode, userHomeCode);
    this.logger.log(logbase, `cập nhập nhà yến(${userHomeCode}) thành nhà yến chính thành công`);
    return result;
  }

  async deleteHome(userHomeCode: string, userCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/deleteHome:`;

    const homeMain = await this.userHomeAppRepository.getMainHomeByUser(userCode);
    // nếu nhà yến muốn xóa đang là chính -> ko thể xóa
    if (homeMain && homeMain.userHomeCode == userHomeCode) {
      throw new BadRequestException({ message: Msg.HomeIsMainCannotDelete, data: 0 });
    }

    const result = await this.userHomeAppRepository.deleteHome(userHomeCode, userCode);
    this.logger.log(logbase, `xóa nhà yến(${userHomeCode}) thành công`);

    return result;
  }
  async updateHome(userCode: string, userHomeCode: string, dto: MutationUserHomeDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/updateHome:`;

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
            const userHomeImagePath = filesUploaded.filename;
            await this.userHomeAppRepository.updateHome(userCode, userHomeCode, dto, userHomeImagePath);

            // cập nhập userHomeSEQ của file mới đã cùng uniqueId với nhà yến vừa updated
            await this.userHomeAppRepository.updateSeqFiles(home.seq, filesUploaded.seq, dto.uniqueId);
          } else {
            throw new BadRequestException({
              message: Msg.UpdateErr,
              data: 0,
            });
          }
        } else {
          // cập nhập dữ liệu -> ảnh vẫn giữ nguyên
          await this.userHomeAppRepository.updateHome(userCode, userHomeCode, dto, home.userHomeImage);
        }
        this.logger.log(logbase, `cập nhập nhà yến(${userHomeCode}) thành công`);
      } else {
        throw new BadRequestException({
          message: Msg.UpdateErr,
          data: 0,
        });
      }

      return result;
    } catch (error) {
      this.logger.error(logbase, JSON.stringify(error));
      return 0;
    }
  }
  async createHome(userCode: string, dto: MutationUserHomeDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/createHome:`;

    try {
      let result = 1;

      // lấy tất cả home của user
      const homesTotal = await this.userHomeAppRepository.getTotalHomes(userCode);
      const userPackage = await this.userAppRepository.getUserPackageInfo(userCode);
      // nếu user xài gói miễn phí hoặc hết hạn và đã có hơn 1 nhà yến rồi -> ko thể thêm nữa trừ khi nâng cập
      if (homesTotal >= 1 && (!userPackage?.packageCode || (userPackage?.packageRemainDay ?? 0) <= 0)) {
        return -2;
      }

      // tìm file đã upload cùng uniqueId
      const filesUploaded = await this.userHomeAppRepository.findFilesByUniqueId(dto.uniqueId);
      // có file được upload cùng uuid -> insert
      if (filesUploaded) {
        // thêm nhà yến của user
        const userHomeImagePath = filesUploaded.filename;
        // kiểm tra user này có nhà nào là chính hay chưa
        const homeMain = await this.userHomeAppRepository.getMainHomeByUser(userCode);
        let isMain = 'N';
        if (!homeMain) {
          isMain = 'Y';
        }
        const seq = await this.userHomeAppRepository.createHome(userCode, dto, isMain, userHomeImagePath);
        // cập nhập userHomeSEQ của file đã tìm cùng uniqueId với nhà yến vừa created
        await this.userHomeAppRepository.updateSeqFiles(seq, filesUploaded.seq, dto.uniqueId);
      } else {
        // không có file ảnh nào được upload của nhà yến này -> báo lỗi
        result = -1;
        return result;
      }

      if (result == 1) {
        this.logger.log(logbase, `thêm nhà yến cho người dùng(${userCode}) thành công`);
      }
      return result;
    } catch (error) {
      this.logger.error(logbase, JSON.stringify(error));
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
          res.filename = filenamePath;
        }
      }
      return res;
    } catch (error) {
      this.logger.error(logbase, JSON.stringify(error));
      return { filename: '' };
    }
  }
}
