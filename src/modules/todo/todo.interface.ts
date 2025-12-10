import { YnEnum } from 'src/interfaces/admin.interface';

export enum PeriodTypeEnum {
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}

export enum TaskStatusEnum {
  WAITING = 'WAITING',
  COMPLETE = 'COMPLETE',
  CANCEL = 'CANCEL',
}

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
  isPeriod: YnEnum;
  periodType: PeriodTypeEnum | null;
  periodValue: number | null;
  specificValue: Date | null;
  taskNote: string;
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
  taskNote: string;
  isActive: YnEnum;
}
