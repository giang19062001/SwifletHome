import { YnEnum } from "src/interfaces/admin.interface";

export interface IUserAuthApp {
  seq: number;
  userCode: string;
  userName: string;
  userPhone: string;
  deviceToken: string;
  isActive: YnEnum;
  accessToken: string;
}
