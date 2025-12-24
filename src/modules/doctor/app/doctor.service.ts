import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoctorDto, DoctorFileDto } from './doctor.dto';
import { DoctorAppRepository } from './doctor.repository';
import { DoctorStatusEnum, IDoctorFileStr } from '../doctor.interface';
import { getFileLocation } from 'src/config/multer.config';
import { LoggingService } from 'src/common/logger/logger.service';
import { Msg } from 'src/helpers/message.helper';

@Injectable()
export class DoctorAppService {
  private readonly SERVICE_NAME = 'DoctorAppService';

  constructor(
    private readonly doctorAppRepository: DoctorAppRepository,
    private readonly logger: LoggingService,
  ) {}

  async requestDoctor(userCode: string, dto: CreateDoctorDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/requestDoctor:`;

    try {
      let result = 1;
      // tìm tất cả file đã upload cùng uniqueId
      const filesUploaded: { seq: number }[] = await this.doctorAppRepository.findFilesByUniqueId(dto.uniqueId);

      if (filesUploaded.length) {
        // mặc định là chờ
        const seq = await this.doctorAppRepository.create(userCode, dto, DoctorStatusEnum.WAITING);
        for (const file of filesUploaded) {
          // cập nhập doctorSeq của các file đã tìm cùng uniqueId với doctor vừa created
          await this.doctorAppRepository.updateSeqFiles(seq, file.seq, dto.uniqueId, userCode);
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
  async uploadRequestFile(userCode: string, dto: DoctorFileDto, doctorFiles: Express.Multer.File[]): Promise<IDoctorFileStr[]> {
    const logbase = `${this.SERVICE_NAME}/uploadFile:`;
    try {
      let res: IDoctorFileStr[] = [];
      if (doctorFiles.length > 0) {
        for (const file of doctorFiles) {
          this.logger.log(logbase, `Đang Upload file.. ${JSON.stringify(file)}`);

          const filenamePath = `${getFileLocation(file.mimetype, file.fieldname)}/${file.filename}`;
          const insertId = await this.doctorAppRepository.uploadFile(0, dto.uniqueId, userCode, filenamePath, file);
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
      return [];
    }
  }
  async deleteRequestFile(seq: number, updatedId: string): Promise<number> {
    const result = await this.doctorAppRepository.deleteSeqFile(seq, updatedId);
    return result;
  }
}
