export interface IInfo {
  seq: number;
  infoKeyword: 'BANK';
  infoName: string;
  infoContent: any;
  infoDescription: string;
  isActive: 'Y' | 'N';
  createdAt: Date;
  updatedAt: Date;
  createdId?: string;
  updatedId?: string;
}

export interface IInfoBank {
  qrcode: string;
  bankName: string;
  bankBranch: string;
  accountName: string;
  accountNumber: string;
  paymentContent: string;
}
