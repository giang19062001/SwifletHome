import { YnEnum } from "src/interfaces/admin.interface";
import { IPackage } from "src/modules/package/package.interface";

export interface IUserApp {
  seq: number;
  userCode: string;
  userName: string;
  userPassword: string;
  userPhone: string;
  deviceToken: string;
  isActive: YnEnum
}

export interface IUserAppInfo extends IUserAppPayment {
  seq: number;
  userCode: string;
  userName: string;
  userPassword: string;
  userPhone: string;
  deviceToken: string;
  isActive: YnEnum
}


export interface IUserAppPayment extends IPackage {
  seq: number;
  userCode: string;
  packageCode: string;
  startDate: string;
  endDate: string;
  isActive: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}
