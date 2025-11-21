import { YnEnum } from "src/interfaces/admin.interface";

export interface IObject {
  seq: number;
  objectKeyword: 'SWIFTLET' | 'TEA' | 'COFFEE';
  objectName: string;
  isActive: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}
