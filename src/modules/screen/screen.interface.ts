import { IInfoBank } from '../info/info.interface';
import { IPackage } from '../package/package.interface';

export interface IScreen {
  seq: number;
  screenKeyword: 'SIGNUP_SERVICE'; // enum('SIGNUP_SERVICE')
  screenName: string;
  screenContent: any;
  screenDescription: string;
  isActive: 'Y' | 'N';
  createdAt: Date;
  updatedAt: Date;
  createdId?: string;
  updatedId?: string;
}

export interface IScreenSignupService {
  contentEnd: string;
  contentStart: string;
  contentCenter: { packages: IPackage[]; bankInfo: IInfoBank | null };
}
