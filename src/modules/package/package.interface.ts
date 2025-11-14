export interface IPackage {
  seq: number;
  packageCode: string;
  packageName: string;
  packagePrice: string;
  packageExpireDay: number;
  isActive: 'Y' | 'N';
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}
