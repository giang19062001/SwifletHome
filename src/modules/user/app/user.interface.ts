
import { ApiProperty } from '@nestjs/swagger';
import { YnEnum } from 'src/interfaces/admin.interface';
import { ITokenUserApp } from 'src/modules/auth/app/auth.interface';


export interface IUserPackageApp {
  userCode: string;
  packageCode: string | null;     
  packageName: string;
  packageDescription: string;
  packageRemainDay: number;
  startDate: string | null;        
  endDate: string | null;
}

interface IuserTypeApp{
  userTypeCode: string,
  userTypeKeyWord: string,
  userTypeName: string
}
export interface IUserApp extends ITokenUserApp, IuserTypeApp, IUserPackageApp {
  homesTotal: number;
}

