
export interface  IUserApp  {
  seq: number;
  userCode: string;
  userName: string;
  userPassword: string;
  userPhone: string;
  deviceToken: string;
}

export interface IUserPackageApp {
  userCode: string;
  packageCode: string;
  packageName: string;
  packageDescription: string;
  packageRemainDay: number; // calculate
  startDate: string;
  endDate: string;
}
