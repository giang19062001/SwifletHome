import { YnEnum } from 'src/interfaces/admin.interface';

export const TODO_CONST = {
  TASK_STATUS: {
    WAITING: {
      value: 'WAITING',
      text: 'Đang chờ',
    },
    COMPLETE: {
      value: 'COMPLETE',
      text: 'Đã hoàn thành',
    },
    CANCEL: {
      value: 'CANCEL',
      text: 'Bị huỷ',
    },
  },
  TASK_EVENT: {
    CANCEL: {
      value: 'CANCEL',
      text: 'Hủy',
    },
    COMPLETE: {
      value: 'COMPLETE',
      text: 'Hoàn thành',
    },
    HARVEST: {
      value: 'HARVEST',
      text: 'Nhập dữ liệu',
    },
    MEDICINE: {
      value: 'MEDICINE',
      text: 'Ghi chú',
    },
  },
};

export enum PeriodTypeEnum {
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}

export enum TaskStatusEnum {
  WAITING = 'WAITING',
  COMPLETE = 'COMPLETE',
  CANCEL = 'CANCEL',
}

export enum TaskLeftEventEnum {
  CANCEL = 'CANCEL',
}
export enum TaskRightEventEnum {
  HARVEST = 'HARVEST',
  MEDICINE = 'MEDICINE',
  COMPLETE = 'COMPLETE',
}

export interface ITodoBoxTask {
  seq: number;
  taskCode: string;
  taskName?: string;
  sortOrder: number;
  isActive: YnEnum;
}

export interface ITodoTask {
  seq: number;
  taskCode: string;
  taskName: string;
  taskKeyword: string;
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
  taskCode: string;
  taskKeyword?: string;
  userCode: string;
  userHomeCode: string;
  taskName: string;
  taskDate: Date;
  taskStatus: TaskStatusEnum;
  taskNote: string;
  isActive: YnEnum;
}

export interface ITodoTaskCompleteMedicine {
  seq: number;
  seqNextTime: number;
  taskAlarmCode: string;
  userCode: string;
  userHomeCode: string;
  medicineNote: string;
}
