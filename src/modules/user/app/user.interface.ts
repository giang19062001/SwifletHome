
import { ITokenUserApp } from 'src/modules/auth/app/auth.interface';

export const USER_CONST = {
  USER_TYPE: {
    OWNER: {
      value: 'OWNER',
      text: 'Chủ nhà yến',
    },
    PURCHASER: {
      value: 'PURCHASER',
      text: 'Nhà thu mua',
    },
    FACTORY: {
      value: 'FACTORY',
      text: 'Xưởng gia công',
    },
    TECHNICAL: {
      value: 'TECHNICAL',
      text: 'Đội kỹ thuật',
    },
  },
}

export enum IUserTeamTypeEnum {
  FACTORY = 'FACTORY',
  TECHNICAL = 'TECHNICAL',
}

export interface IUserPackageApp {
  userCode: string;
  packageCode: string | null;     
  packageName: string;
  packageDescription: string;
  packageRemainDay: number;
  startDate: string | null;        
  endDate: string | null;
}

interface IUserTypeApp{
  userTypeCode: string,
  userTypeKeyWord: string,
  userTypeName: string
}
export interface IUserApp extends ITokenUserApp, IUserTypeApp, IUserPackageApp {
  homesTotal: number;
}

