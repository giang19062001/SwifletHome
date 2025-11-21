import { YnEnum } from "src/interfaces/admin.interface";

export interface ICode {
  seq: number;
  code: string;
  mainCode: string;
  subCode: string;
  keyCode: string;
  valueCode: string;
  sortOrder: number;
  isActive: YnEnum;
}
