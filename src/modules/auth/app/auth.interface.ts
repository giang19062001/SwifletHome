import { YnEnum } from 'src/interfaces/admin.interface';

// ~ giá trị trong token
export interface ITokenUserApp {
  seq: number;
  userCode: string;
  userName: string;
  // userPassword: string;
  userPhone: string;
  deviceToken: string;
  userTypeCode: string;
  userTypeKeyWord: string;
  countryCode: string;
  isActive: YnEnum;
  iat?: number;
  exp?: number;
}

export interface ITokenUserAppWithPassword extends ITokenUserApp {
  userPassword: string;
}
