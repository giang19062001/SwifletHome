export interface IUserAuthApp {
  seq: number;
  userCode: string;
  userName: string;
  userPhone: string;
  userDevice: string;
  isActive: 'Y' | 'N';
  accessToken: string;
}
