export interface IPackage {
  seq: number;
  packageCode: string;
  packageName: string;
  packagePrice: string;
  packageExpireDay: number;
  isActive: 'Y' | 'N';
  createdAt: string;
  updatedAt: string;
  createdId: string;
  updatedId: string;
}
