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
      // mặc định là chờ 'WAITING'
      const seq = await this.doctorAppRepository.create(userCode, dto, "WAITING");
      if (seq) {
        const doctor = await this.doctorAppRepository.getDetail(seq);
        if (doctor) {
          // tìm tất cả file đã upload cùng uniqueId
          const filesUploaded: { seq: number }[] = await this.doctorAppRepository.findFilesByUniqueId(doctor.uniqueId);
          if (filesUploaded.length) {
            for (const file of filesUploaded) {
              // update doctorSeq của các file đã tìm cùng uniqueId với doctor vừa created
              await this.doctorAppRepository.updateSeqFiles(seq, file.seq, doctor.uniqueId);
            }
          } else {
            // những files có uniqueId của doctor hiện tại không tồn tại -> xóa doctor để đông nhất dữ liệu
            await this.doctorAppRepository.delete(seq);
            result = -1;
          }
        }
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
