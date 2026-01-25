import { PagingDto } from "src/dto/admin.dto";
import { IList } from "src/interfaces/admin.interface";
import { QrAdminRepository } from "./qr.repository";
import { LoggingService } from "src/common/logger/logger.service";
import { Injectable } from "@nestjs/common";
import { IAllQrRequest } from "./qr.inteface";



@Injectable()
export class QrAdminService {
  private readonly SERVICE_NAME = 'QrAdminService';
  constructor(
    private readonly qrAdminRepository: QrAdminRepository,
    private readonly logger: LoggingService,
  ) {}
  async getAll(dto: PagingDto): Promise<IList<IAllQrRequest>> {
    const total = await this.qrAdminRepository.getTotal();
    const list = await this.qrAdminRepository.getAll(dto);
    return { total, list };
  }
}