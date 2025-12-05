import { YnEnum } from 'src/interfaces/admin.interface';
import { IInfoBank } from '../info/info.interface';

export interface IScreen {
  seq: number;
  screenKeyword: string; // enum('')
  screenName: string;
  screenContent: any;
  screenDescription: string;
  isActive: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId?: string;
  updatedId?: string;
}

export interface IScreenSignupService {
  contentEnd: string;
  contentStart: string;
  contentCenter: { packages: string[]; bankInfo: IInfoBank | null };
}
