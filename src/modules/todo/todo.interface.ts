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

export interface ITodoHomeTaskPeriod {
  seq: number;
  taskPeriodCode: string;
  userCode: string;
  userHomeCode: string;
  taskCode: string | null;
  isCustomTask: YnEnum;
  taskCustomName: string;
  taskType: TaskTypeEnum;
  periodValue: number | null;
  specificValue: Date | null;
  isActive: YnEnum;
}

export interface ITodoHomeTaskAlram {
  seq: number;
  taskAlarmCode: string;
  taskPeriodCode: string;
  userCode: string;
  userHomeCode: string;
  taskName: string;
  taskDate: Date;
  taskStatus: TaskStatusEnum;
  isActive: YnEnum;
}
