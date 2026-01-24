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
    SKIP: {
      value: 'SKIP',
      text: 'Bỏ qua',
    },
  },
  TASK_OPTION_MEDICINE: {
    OTHER: {
      value: 'OTHER',
      text: 'Khác',
    },
  },
  TASK_BOX: {
    HARVEST: {
      value: 'HARVEST',
      text: 'Nhập dữ liệu',
    },
    MEDICINE: {
      value: 'MEDICINE',
      text: 'Ghi chú',
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
  COMPLETE_SOON = 'COMPLETE_SOON',
  CANCEL = 'CANCEL',
  SKIP = 'SKIP',
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

export interface ITodoTaskMedicine {
  seq: number;
  seqNextTime: number;
  userCode: string;
  userHomeCode: string;
  medicineOptionCode: string;
  medicineOther: string;
  medicineUsage: string;
}

export interface IHarvestTask {
  seqAlarm: number;
  userCode: string;
  userHomeCode: string;
  floor: number;
  cell: number;
  cellCollected: number;
  cellRemain: number;
}
export interface IHarvestTaskPhase {
  seq: number;
  seqAlarm: string;
  harvestPhase: number;
  harvestYear: number;
  isDone: string;
}

interface IHarvestData {
  floor: number;
  floorData: IFloorData[];
}

interface IFloorData {
  cell: number;
  cellCollected: number;
  cellRemain: number;
}
