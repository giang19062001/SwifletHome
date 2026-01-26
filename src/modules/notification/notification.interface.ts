import { YnEnum } from 'src/interfaces/admin.interface';

export const NOTIFICATION_CONST = {
  TOPIC: {
    COMMON: 'COMMON',
  },
};

export enum NotificationStatusEnum {
  SENT = 'SENT',
  READ = 'READ',
}

export enum NotificationTypeEnum {
  ADMIN = 'ADMIN',
  TODO = 'TODO',
  ADMIN_QR = 'ADMIN_QR'
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
