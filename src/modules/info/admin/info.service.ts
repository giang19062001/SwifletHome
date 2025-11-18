import { BadRequestException, Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin';
import { IList } from 'src/interfaces/admin';
import { AbAdminService } from 'src/abstract/admin.service';
import { UpdateInfoDto } from './info.dto';
import { IInfo } from '../info.interface';
import { InfoAdminRepository } from './info.repository';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { getFileLocation, validateImgExt } from 'src/config/multer';
import { IMG_TYPES } from 'src/helpers/const';
import { Msg } from 'src/helpers/message';

@Injectable()
export class InfoAdminService extends AbAdminService {
  constructor(
    private readonly infoAdminRepository: InfoAdminRepository,
    private readonly fileLocalService: FileLocalService,
  ) {
    super();
  }
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
  async replaceFiledFile( filedFile: string, file: Express.Multer.File) : Promise<string>{
    const isValid = validateImgExt(file.originalname);
    if (isValid) {
      const location = getFileLocation(file.mimetype, file.fieldname);

      const newFileName = await this.fileLocalService.replaceFile(file, filedFile, location);
      return `/uploads/${location}/${newFileName}`
    } else {
      // lỗi type ảnh
      throw new BadRequestException(Msg.fileWrongType(file.originalname, IMG_TYPES));
    }
  }
  async getAll(dto: PagingDto): Promise<IList<IInfo>> {
    const total = await this.infoAdminRepository.getTotal();
    const list = await this.infoAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(infoKeyword: string): Promise<IInfo | null> {
    const result = await this.infoAdminRepository.getDetail(infoKeyword);
    return result;
  }
  create(dto: any): Promise<number> {
    throw new Error('Method not implemented.');
  }
  async update(dto: UpdateInfoDto, infoKeyword: string): Promise<number> {
    const result = await this.infoAdminRepository.update(dto, infoKeyword);
    return result;
  }
  delete(dto: string | number): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
