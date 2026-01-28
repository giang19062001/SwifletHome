import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { QrAdminRepository } from './qr.repository';
import { LoggingService } from 'src/common/logger/logger.service';
import { Injectable } from '@nestjs/common';
import { IQrRequest } from './qr.inteface';
import { RequestStatusEnum } from '../qr.interface';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { GetAllInfoRequestQrCodeAdminResDto, WriteQrBlockchainDto } from './qr.dto';
import { ContractService } from 'src/common/contract/contract.service';
import { FirebaseService } from 'src/common/firebase/firebase.service';
import { UserAdminRepository } from 'src/modules/user/admin/user.repository';
import { NOTIFICATIONS } from 'src/helpers/text.helper';
import { NotificationTypeEnum } from 'src/modules/notification/notification.interface';

@Injectable()
export class QrAdminService {
  private readonly SERVICE_NAME = 'QrAdminService';
  constructor(
    private readonly qrAdminRepository: QrAdminRepository,
    private readonly fileLocalService: FileLocalService,
    private readonly contractService: ContractService,
    private readonly firebaseService: FirebaseService,
    private readonly userAdminRepository: UserAdminRepository,
    private readonly logger: LoggingService,
  ) {}
  async getAll(dto: PagingDto): Promise<IList<IQrRequest>> {
    const total = await this.qrAdminRepository.getTotal();
    const list = await this.qrAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(requestCode: string): Promise<GetAllInfoRequestQrCodeAdminResDto | null> {
    const result = await this.qrAdminRepository.getDetail(requestCode);
    return result;
  }
  async approved(requestCode: string, updatedId: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/approved:`;

    try {
      // generate qrcode
      const qrCode = await this.fileLocalService.generateQrcode(requestCode);
      if (!qrCode) return 0;
      if (qrCode) {
        this.logger.log(logbase, `Generate qrcode ${JSON.stringify(qrCode)}`);
        // lấy chi tiết info
        const detail = await this.getDetail(requestCode);
        if (!detail) return 0;

        // ghi blockchain
        const blockchainData = await this.contractService.recordJson({ userCode: detail.userCode!!, userHomeCode: detail.userHomeCode, qrTargetUrl: qrCode.qrTargetUrl });
        const dto: WriteQrBlockchainDto = {
          userCode: detail.userCode!!,
          userHomeCode: detail.userHomeCode,
          qrCodeUrl: qrCode.qrCodeUrl,
          requestCode: requestCode,
          transactionHash: blockchainData.transactionHash,
          blockNumber: blockchainData.blockNumber,
          transactionFee: blockchainData.transactionFee,
        };
        await this.qrAdminRepository.writeQrBlockchain(dto);

        // CẬP NHẬP yêu cầu thành THÀNH CÔNG
        await this.qrAdminRepository.updateRequsetStatus(requestCode, RequestStatusEnum.APPROVED, updatedId);

        // send thông báo
        const user = await this.userAdminRepository.getDetailUserApp(detail.userCode!!);
        if (!user) return 0;

        const notify = NOTIFICATIONS.QR_CODE_APPROVED(requestCode);
        this.firebaseService.sendNotification(user.userCode, user.deviceToken, notify.TITLE, notify.BODY, { requestCode: requestCode }, NotificationTypeEnum.ADMIN_QR);
      }
      return 1;
    } catch (error) {
      this.logger.error(logbase, `error ${JSON.stringify(error)}`);
      return 0;
    }
  }
  async refuse(requestCode: string, updatedId: string): Promise<number> {
    const result = await this.qrAdminRepository.updateRequsetStatus(requestCode, RequestStatusEnum.REFUSE, updatedId);
    return result;
  }
}
