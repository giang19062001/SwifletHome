import { YnEnum } from "src/interfaces/admin.interface";

export enum MediaBadgeEnum {
  NORMAL = 'NORMAL',
  NEW = 'NEW',
}


export interface IFileUpload {
  seq: number;
  filename: string;
  filenamePay: string;
  originalname: string;
  size: number;
  mimetype: string;
  urlLink: string;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}


export interface IAudioFreePay {
  filenameFree: string;
  mimetypeFree: string;
  filenamePay: string;
  mimetypePay: string;
}

export interface IFileMedia {
  seq: number;
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  urlLink: string;
  isFree?: YnEnum;
  isCoupleFree?: YnEnum;
  badge:  MediaBadgeEnum;
  createdAt: Date;
}
