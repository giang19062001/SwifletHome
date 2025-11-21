import { YnEnum } from "src/interfaces/admin.interface";
import { IUserAppPayment } from "src/modules/userPayment/app/userPayment.interface";

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


