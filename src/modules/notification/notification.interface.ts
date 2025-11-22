import { YnEnum } from "src/interfaces/admin.interface";

enum NotifyStatusEnum {
  SENT = 'SENT',
  READ = 'READ',
  FAIL = 'FAIL',
}

export interface INotification {
  seq: number;
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
