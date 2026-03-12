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
  // HARVEST = 'HARVEST',
  // MEDICINE = 'MEDICINE',
  COMPLETE = 'COMPLETE',
}
