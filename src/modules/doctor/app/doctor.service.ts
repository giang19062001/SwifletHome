import { UploadService } from '../../upload/upload.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoctorDto, DoctorFileDto } from './doctor.dto';
import { DoctorAppRepository } from './doctor.repository';
import { IDoctorFileStr } from '../doctor.interface';
import { getFileLocation } from 'src/config/multer.config';
import { LoggingService } from 'src/common/logger/logger.service';
import { UserAppService } from 'src/modules/user/app/user.service';

@Injectable()
export class DoctorAppService {
  private readonly SERVICE_NAME = 'DoctorAppService';

  constructor(
    private readonly doctorAppRepository: DoctorAppRepository,
    private readonly userAppService: UserAppService,
    private readonly logger: LoggingService,
  ) {}

  async create(userCode: string, dto: CreateDoctorDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/createDoctor:`;

    try {
      let result = 1;
      // tìm tất cả file đã upload cùng uniqueId
      const filesUploaded: { seq: number }[] = await this.doctorAppRepository.findFilesByUniqueId(dto.uniqueId);
      if (filesUploaded.length) {
        // mặc định là chờ 'WAITING'
        const seq = await this.doctorAppRepository.create(userCode, dto, 'WAITING');
        for (const file of filesUploaded) {
          // cập nhập doctorSeq của các file đã tìm cùng uniqueId với doctor vừa created
          await this.doctorAppRepository.updateSeqFiles(seq, file.seq, dto.uniqueId);
        }
      } else {
        // không có file ảnh nào được upload của đơn khám bệnh này -> báo lỗi
        result = -1;
      }
      return result;
    } catch (error) {
      this.logger.error(logbase, error);
      return 0;
    }
  }
  async uploadFile(userCode: string, dto: DoctorFileDto, doctorFiles: Express.Multer.File[]): Promise<IDoctorFileStr[]> {
    const logbase = `${this.SERVICE_NAME}/uploadFile:`;
    try {
      let filesResponse: IDoctorFileStr[] = [];
      if (doctorFiles.length > 0) {
        for (const file of doctorFiles) {
          const result = await this.doctorAppRepository.uploadFile(0, dto.uniqueId, userCode, file);
          if (result > 0) {
            const location = getFileLocation(file.mimetype, file.fieldname);
            filesResponse.push({ filename: `/${location}/${file.filename}` });
          }
        }
      }
      return filesResponse;
    } catch (error) {
      this.logger.error(logbase, error);
      return [];
    }
  }
}
