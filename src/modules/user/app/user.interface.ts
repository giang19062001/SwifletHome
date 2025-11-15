export interface IUserApp {
  seq: number;
  userCode: string;
  userName: string;
  userPassword: string;
  userPhone: string;
  deviceToken: string;
  isActive: 'Y' | 'N';
  accessToken: string;
}
