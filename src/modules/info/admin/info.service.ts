import { BadRequestException, Injectable } from '@nestjs/common';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { getFileLocation, validateImgExt } from 'src/config/multer.config';
import { PagingDto } from 'src/dto/admin.dto';
import { IMG_TYPES } from 'src/helpers/const.helper';
import { Msg } from 'src/helpers/message.helper';
import { InfoResDto } from "../info.response";
import { UpdateInfoDto } from './info.dto';
import { InfoAdminRepository } from './info.repository';

@Injectable()
export class InfoAdminService {
  constructor(
    private readonly infoAdminRepository: InfoAdminRepository,
    private readonly fileLocalService: FileLocalService,
  ) {}
  getFieldFileByKeyword(infoKeyword: string) {
    let fieldFile = '';
    switch (infoKeyword) {
      case 'BANK':
        fieldFile = 'qrcode';
        break;
      default:
        fieldFile = '';
    }
    return fieldFile;
  }
  async replaceFiledFile(filedFile: string, file: Express.Multer.File): Promise<string> {
    const isValid = validateImgExt(file.originalname);
    if (isValid) {
      const location = getFileLocation(file.mimetype, file.fieldname);

      const newFileName = await this.fileLocalService.replaceFile(file, filedFile, location);
      return `${location}/${newFileName}`;
    } else {
      // lỗi type ảnh
      throw new BadRequestException(Msg.FileWrongType(file.originalname, IMG_TYPES));
    }
  }
  async getAll(dto: PagingDto): Promise<{ total: number; list: InfoResDto[] }> {
    const total = await this.infoAdminRepository.getTotal();
    const list = await this.infoAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(infoKeyword: string): Promise<InfoResDto | null> {
    const result = await this.infoAdminRepository.getDetail(infoKeyword);
    return result;
  }

  async update(dto: UpdateInfoDto, updatedId: string, infoKeyword: string): Promise<number> {
    const result = await this.infoAdminRepository.update(dto, updatedId, infoKeyword);
    return result;
  }
}
