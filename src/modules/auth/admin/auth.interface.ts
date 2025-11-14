export interface IUserAuthAdmin {
  seq: number;
  userId: string;
  userPassword: string;
  userName: string;
  isActive: 'Y' | 'N';
  accessToken: string;
}
