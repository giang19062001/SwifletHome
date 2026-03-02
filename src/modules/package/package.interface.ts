import { YnEnum } from 'src/interfaces/admin.interface';

export interface IPackage {
  seq: number;
  packageCode: string;
  packageName: string;
  packageDescription: string;
  packagePrice: string;
  packageItemSamePrice: string;
  packageExpireDay: number;
  packageOptionType: PackageOptionTypeEnum;
  isActive: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}

export enum PackageOptionTypeEnum {
  MONEY = 'MONEY',
  ITEM = 'ITEM',
  BOTH = 'BOTH',
}
