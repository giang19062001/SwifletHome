import { YnEnum } from "src/interfaces/admin.interface";

enum NotifyStatusEnum {
  SENT = 'SENT',
  READ = 'READ',
  FAIL = 'FAIL',
}

export interface INotification {
  seq: number;
  notificationId: string;
  messageId: string;
  title: string;
  body: Text;
  data: string | any;
  userCode: string;
  topicCode: string;
  status: NotifyStatusEnum;
  isActive: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}


export interface INotificationTopic {
  seq: number;
  topicCode: string;
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
  isActive: YnEnum;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}
