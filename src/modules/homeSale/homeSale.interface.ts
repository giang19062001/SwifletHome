import { YnEnum } from "src/interfaces/admin.interface";

export interface IHomeSale {
  seq: number;
  homeCode: string;
  homeName: string;
  homeAddress: string;
  homeDescription: string;
  latitude: number;
  longitude: number;
  isDelete: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
  homeImage: string | IHomeSaleImg;
  homeImages: IHomeSaleImg[]
}

export interface IHomeSaleImg {
  seq: number;
  homeSeq: number;
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  isDelete: YnEnum;
  width? : number;
  height?: number
}


export interface IHomeSaleSightSeeing {
  seq: number;
  homeCode: string;
  userCode: string;
  userName: string;
  userPhone: string;
  numberAttend: string;
  status: string;
  note: string;
  cancelReason: string;
  createdId: string;
  updatedId: string;
}
