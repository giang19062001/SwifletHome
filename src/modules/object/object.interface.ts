export interface IObject {
  seq: number;
  objectKeyword: 'SWIFTLET' | 'TEA' | 'COFFEE';
  objectName: string;
  isActive: 'Y' | 'N';
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}
