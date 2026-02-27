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

export interface INotification {
  seq: number;
  notificationId: string;
  messageId: string;
  title: string;
  body: Text;
  data: string | any;
  targetScreen: string;
  userCode?: string;
  userCodesMuticast?: string[];
  topicCode?: string;
  notificationType: NotificationTypeEnum;
  notificationTypeLabel?: string;
  notificationStatus: NotificationStatusEnum;
  isActive: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}

export interface INotificationTopic {
  seq: number;
  topicCode: string;
  topicKeyword: string;
  topicName: string;
  topicDescription: string;
  isActive: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}

export interface IUserNotificationTopic {
  seq: number;
  userCode: string;
  topicCode: string;
  topicName?: string;
  isActive: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}

export interface IUserHomeProvinceForPush {
  userCode: string;
  deviceToken: string;
  userHomeCode: string;
  userHomeProvince: string;
}

export interface IUserHomeForPush {
  userCode: string;
  deviceToken: string;
  userHomeCode: string;
}
