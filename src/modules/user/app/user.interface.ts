import { IUserAppPayment } from "src/modules/userPayment/app/userPayment.interface";

export interface IUserApp {
  seq: number;
  userCode: string;
  userName: string;
  userPassword: string;
  userPhone: string;
  deviceToken: string;
  isActive: 'Y' | 'N';
}

export interface IUserAppInfo extends IUserAppPayment {
  seq: number;
  userCode: string;
  userName: string;
  userPassword: string;
  userPhone: string;
  deviceToken: string;
  isActive: 'Y' | 'N';
}


