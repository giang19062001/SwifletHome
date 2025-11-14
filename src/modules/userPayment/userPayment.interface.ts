export interface IUserPayment {
  seq: number;
  userCode: string;
  packageCode: string;
  startDate: string;
  endDate: string;
  isActive: 'Y' | 'N';
  createdAt: string;
  updatedAt: string;
  createdId: string;
  updatedId: string;
}
