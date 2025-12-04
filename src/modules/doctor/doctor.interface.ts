import { YnEnum } from "src/interfaces/admin.interface";

export interface IDoctor {
  seq: number;
  userCode: string;
  userName: string;
  userPhone: string;
  note: string;
  noteAnswered: string;
  status: string;
  uniqueId: string;
  isDelete: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
  doctorFiles: IDoctorFile[]
}

export interface IDoctorFileStr {
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
  isDelete: YnEnum;
}
