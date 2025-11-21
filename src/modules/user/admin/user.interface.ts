import { YnEnum } from "src/interfaces/admin.interface";

export interface IUserAdmin {
  seq: number;
  userId: string;
  userPassword: string;
  userName: string;
  isActive: YnEnum
}
