import { YnEnum } from "src/interfaces/admin.interface";

export interface IUserAuthAdmin {
  seq: number;
  userId: string;
  userPassword: string;
  userName: string;
  isActive: YnEnum;
  accessToken: string;
}
