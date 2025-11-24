import { UploadService } from '../../upload/upload.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { getFileLocation } from 'src/config/multer.config';
import { LoggingService } from 'src/common/logger/logger.service';
import { UserAppService } from 'src/modules/user/app/user.service';
import { IUserHome, IUserHomeImageStr } from './userHome.interface';
import { CreateUserHomeDto, UploadUserHomeImageDto } from './userHome.dto';
import { UserHomeAppRepository } from './userHome.repository';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';

@Injectable()
export class UserHomeAppService {
  private readonly SERVICE_NAME = 'UserHomeAppService';

  constructor(
    private readonly userHomeAppRepository: UserHomeAppRepository,
    private readonly logger: LoggingService,
  ) {}
  async getAll(dto: PagingDto, userCode: string): Promise<IList<IUserHome>> {
    const total = await this.userHomeAppRepository.getTotal(userCode);
    const list = await this.userHomeAppRepository.getAll(dto, userCode);
    return { total, list };
  }
  
  async create(userCode: string, dto: CreateUserHomeDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/create:`;

    try {
      let result = 1;

      // tìm file đã upload cùng uniqueId
      const filesUploaded: { seq: number; filename: string; mimetype: string }[] = await this.userHomeAppRepository.findFilesByUniqueId(dto.uniqueId);
      if (filesUploaded.length) {
        // thêm nhà yến của user
        const filepath = `/uploads/${getFileLocation(filesUploaded[0].mimetype, filesUploaded[0].filename)}/${filesUploaded[0].filename}`;
        // kiểm tra user này có nhà nào là chính hay chưa
        const checkMain = await this.userHomeAppRepository.findMainHomeDetail(userCode)
        let isMain = 'N'
        if(!checkMain){
          isMain = 'Y'
        }
        const seq = await this.userHomeAppRepository.create(userCode, dto, isMain, filepath);
        // cập nhập userHomeSEQ của file đã tìm cùng uniqueId với doctor vừa created
        await this.userHomeAppRepository.updateSeqFiles(seq, filesUploaded[0].seq, dto.uniqueId);
      } else {
        // không có file ảnh nào được upload của nhà yến này -> báo lỗi
        result = -1;
      }

      return result;
    } catch (error) {
      this.logger.error(logbase, error);
      return 0;
    }
  }
  async uploadImageForCreating(userCode: string, dto: UploadUserHomeImageDto, userHomeImage: Express.Multer.File): Promise<IUserHomeImageStr> {
    const logbase = `${this.SERVICE_NAME}/uploadImageForCreating:`;
    try {
      let res: IUserHomeImageStr = { filename: '' };
      if (userHomeImage) {
        const result = await this.userHomeAppRepository.uploadImageForCreating(0, dto.uniqueId, userCode, userHomeImage);
        if (result > 0) {
          const location = getFileLocation(userHomeImage.mimetype, userHomeImage.fieldname);
          res.filename = `/${location}/${userHomeImage.filename}`;
        }
      }
      return res;
    } catch (error) {
      this.logger.error(logbase, error);
      return { filename: '' };
    }
  }
}
