import { YnEnum } from "src/interfaces/admin.interface";

export interface IBlog {
  seq: number;
  blogCode: string;
  blogObject: string;
  blogContent: string;
  blogCategory: string;
  blogScreenCode: string;
  isActive: YnEnum;
  isFree: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}
