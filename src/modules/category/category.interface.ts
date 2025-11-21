import { YnEnum } from "src/interfaces/admin.interface";

export interface ICategory {
  seq: number;
  categoryCode: string;
  categoryName: string;
  isActive: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}
