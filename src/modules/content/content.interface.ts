import { IInfoBank } from '../info/info.interface';
import { IPackage } from '../package/package.interface';

export interface IContent {
  seq: number;
  contentCharacter: 'SIGNUP_SERVICE'; // enum('SIGNUP_SERVICE')
  contentName: string;
  contentContent: any;
  contentDescription: string;
  isActive: 'Y' | 'N';
  createdAt: Date;
  updatedAt: Date;
  createdId?: string;
  updatedId?: string;
}

export interface IContentSignupService {
  contentEnd: string;
  contentStart: string;
  contentCenter: { packages: IPackage[]; bankInfo: IInfoBank | null };
}
