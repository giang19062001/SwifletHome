export interface ICategory {
  seq: number;
  categoryCode: string;
  categoryName: string;
  isActive: 'Y' | 'N';
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}
