import { YnEnum } from "src/interfaces/admin.interface";

export interface IUserHomeSensor {
  seq: number;
  userHomeCode: string;
  userCode: string;
  userName?: string;
  userPhone?: string;
  userHomeName: string;
  userHomeAddress: string;
  userHomeProvince: string;
  userHomeDescription: string;
  userHomeImage: string;
  uniqueId: string;
  isIntegateTempHum: YnEnum;
  isIntegateCurrent: YnEnum;
  isTriggered: YnEnum;
  isDelete: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
  macId: string;
  wifiId: string;
  wifiPassword: string
}