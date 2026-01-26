import { YnEnum } from 'src/interfaces/admin.interface';

export const QR_CODE_CONST = {
  REQUEST_STATUS: {
    WAITING: {
      value: 'WAITING',
      text: 'Đang chờ',
    },
    APPROVED: {
      value: 'APPROVED',
      text: 'Đã duyệt',
    },
    CANCEL: {
      value: 'CANCEL',
      text: 'Đã huỷ',
    },
    REFUSE: {
      value: 'REFUSE',
      text: 'Bị từ chối',
    },
    SOLD: {
      value: 'SOLD',
      text: 'Đã bán',
    },
  },
}
export interface IQrRequestFile {
  seq: number;
  qrRequestSeq: number;
  userCode: string;
  uniqueId: string;
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  isActive: YnEnum;
}

export enum RequestStatusEnum {
  WAITING = 'WAITING',
  APPROVED = 'APPROVED',
  REFUSE = 'REFUSE',
  CANCEL = 'CANCEL',
  SOLD = 'SOLD'
}

export enum RequestSellStatusEnum {
  WAITING = 'WAITING',
  APPROVED = 'APPROVED',
  REFUSE = 'REFUSE',
}

