import { IPackage } from "../package/package.interface";

export interface IUserAppPayment extends IPackage {
  seq: number;
  userCode: string;
  packageCode: string;
  startDate: string;
  endDate: string;
  isActive: 'Y' | 'N';
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}
