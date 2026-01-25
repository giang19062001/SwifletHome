import { RequestStatusEnum } from "../qr.interface";

export interface IAllQrRequest {
  seq: number,
  requestCode: string;
  userCode: string;
  userName: string;
  userHomeCode: string;
  userHomeName: string;
  userHomeLength: number;
  userHomeWidth: number;
  userHomeFloor: number;
  userHomeAddress: string;
  temperature: number;
  humidity: number;
  harvestPhase: number;
  requestStatus: RequestStatusEnum,
  taskMedicineCount: number,
  createdAt: Date
}
