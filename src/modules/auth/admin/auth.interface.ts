import { YnEnum } from "src/interfaces/admin.interface";

export interface ITokenUserAdmin {
  seq: number;
  userId: string;
  userPassword: string;
  userName: string;
  isActive: YnEnum
}
