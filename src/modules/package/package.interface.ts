import { YnEnum } from "src/interfaces/admin.interface";

export interface IPackage {
  seq: number;
  packageCode: string;
  packageName: string;
  packageDescription: string;
  packagePrice: string;
  packageExpireDay: number;
  isDelete: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}
