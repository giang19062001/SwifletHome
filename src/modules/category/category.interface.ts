import { YnEnum } from "src/interfaces/admin.interface";

export interface ICategory {
  seq: number;
  categoryCode: string;
  categoryName: string;
  isDelete: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}
