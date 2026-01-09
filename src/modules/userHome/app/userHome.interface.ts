import { YnEnum } from 'src/interfaces/admin.interface';

export interface IUserHome {
  seq: number;
  userHomeCode: string;
  userCode: string;
  userName?: string;
  userPhone?: string;
  userHomeName: string;
  userHomeAddress: string;
  userHomeProvince: string;
  userHomeDescription: string;
  userHomeImage: string;
  userHomeHeight: number;
  userHomeWidth: number;
  userHomeFloor: number;
  uniqueId: string;
  isIntegateTempHum: YnEnum;
  isIntegateCurrent: YnEnum;
  isTriggered: YnEnum;
  isActive: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}

export interface IUserHomeImageStr {
  seq: number;
  filename: string;
}

export interface IUserHomeImageFile {
  seq: number;
  userHomeSeq: number;
  userCode: string;
  uniqueId: string;
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  isActive: YnEnum;
}
