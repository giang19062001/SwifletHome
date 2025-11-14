export interface IUserApp {
  seq: number;
  userCode: string;
  userName: string;
  userPassword: string;
  userPhone: string;
  userDevice: string;
  isActive: 'Y' | 'N';
  accessToken: string;
}
