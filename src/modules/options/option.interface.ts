import { YnEnum } from "src/interfaces/admin.interface";

export interface IOpition {
  seq: number;
  code: string;
  mainOption: string;
  subOption: string;
  keyOption: string;
  valueOption: string;
  sortOrder: number;
  isActive: YnEnum;
}
