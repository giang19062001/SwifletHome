import { YnEnum } from 'src/interfaces/admin.interface';

export const NOTIFICATION_CONST = {
  TOPIC: {
    COMMON: 'COMMON',
  },
  NOTIFICATION_TYPE: {
    ADMIN: {
      value: 'ADMIN',
      text: 'Admin',
    },
    TODO: {
      value: 'TODO',
      text: 'Việc cần làm',
    },
    ADMIN_QR: {
      value: 'ADMIN_QR',
      text: 'Thông tin QRcode',
    },
  },
};

export enum NotificationStatusEnum {
  SENT = 'SENT',
  READ = 'READ',
}

export enum NotificationTypeEnum {
  ADMIN = 'ADMIN',
  TODO = 'TODO',
  ADMIN_QR = 'ADMIN_QR',
}
