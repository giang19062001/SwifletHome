import { YnEnum } from 'src/interfaces/admin.interface';

export interface ITodoTask {
  seq: number;
  taskCode: string;
  taskName: string;
  isDelete: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}
