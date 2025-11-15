export interface IUserAuthApp {
  seq: number;
  userCode: string;
  userName: string;
  userPhone: string;
  deviceToken: string;
  isActive: 'Y' | 'N';
  accessToken: string;
}
