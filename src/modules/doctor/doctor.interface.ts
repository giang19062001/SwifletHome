import { YnEnum } from "src/interfaces/admin.interface";

export enum DoctorStatusEnum {
  WAITING = 'WAITING',
  ANSWERED = 'ANSWERED',
  CANCEL = 'CANCEL'
}

export interface IDoctor {
  seq: number;
  userCode: string;
  userName: string;
  userPhone: string;
  note: string;
  noteAnswered: string;
  status: DoctorStatusEnum;
  uniqueId: string;
  isActive: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
  doctorFiles: IDoctorFile[]
}

export interface IDoctorFileStr {
  seq: number;
  filename: string;
}

export interface IDoctorFile {
  seq: number;
  doctorSeq: number;
  userCode: string;
  homeName: string;
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  uniqueId: string;
  isActive: YnEnum;
}
