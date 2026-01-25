import { YnEnum } from 'src/interfaces/admin.interface';

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
}

export enum RequestSellStatusEnum {
  WAITING = 'WAITING',
  APPROVED = 'APPROVED',
  REFUSE = 'REFUSE',
}

