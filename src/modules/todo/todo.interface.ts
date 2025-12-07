import { YnEnum } from 'src/interfaces/admin.interface';
import { TaskStatusEnum, TaskTypeEnum } from './app/todo.dto';

export interface ITodoTask {
  seq: number;
  taskCode: string;
  taskName: string;
  isActive: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}

export interface ITodoHomeTask {
  seq: number;
  userCode: string;
  userHomeCode: string;
  taskCode: string | null;
  isCustomTask: YnEnum;
  taskCustomName: string;
  taskType: TaskTypeEnum;
  taskStatus: TaskStatusEnum;
  periodValue: number | null;
  specificValue: Date | null;
  isActive: YnEnum
}
