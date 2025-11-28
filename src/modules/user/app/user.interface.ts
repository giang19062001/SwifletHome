import { YnEnum } from 'src/interfaces/admin.interface';
import { IPackage } from 'src/modules/package/package.interface';

export interface IUserApp {
  seq: number;
  userCode: string;
  userName: string;
  userPassword: string;
  userPhone: string;
  deviceToken: string;
  isActive: YnEnum;
  accessToken: string;
  packageCode: string;
  packageName: string;
  packageRemainDays: number; // calculate
}

export interface IUserAppInfo extends IUserAppPackage {
  seq: number;
  userCode: string;
  userName: string;
  userPassword: string;
  userPhone: string;
  deviceToken: string;
  isActive: YnEnum;
}

export interface IUserAppPackage extends IPackage {
  seq: number;
  userCode: string;
  packageCode: string;
  packageName: string;
  startDate: string;
  endDate: string;
  packageRemainDays: number; // calculate
  isActive: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}
