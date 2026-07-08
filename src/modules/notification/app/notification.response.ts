import { ApiProperty } from '@nestjs/swagger';
import { APP_SCREENS } from 'src/helpers/const.helper';
import { YnEnum } from 'src/interfaces/admin.interface';
import { NotificationStatusEnum, NotificationTypeEnum } from '../notification.interface';

export class GetNotificationResDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: '' })
  notificationId: string;

  @ApiProperty({ example: '' })
  messageId: string;

  @ApiProperty({ example: '' })
  title: string;

  @ApiProperty({ example: '' })
  body: string;

  @ApiProperty({ example: null })
  data: any | null;

  @ApiProperty({ example: APP_SCREENS.REMINDER_SCREEN })
  targetScreen: string;

  // @ApiProperty({ example: '' })
  // userCode: string;

  // @ApiProperty({
  //   example: [""],
  //   type: [String],
  // })
  // @IsArray()
  // userCodesMuticast: string[];

  // @ApiProperty({ example: '' })
  // topicCode: string | null;

  @ApiProperty({ example: NotificationTypeEnum.ADMIN })
  notificationType: NotificationTypeEnum;

  @ApiProperty({ example: NotificationStatusEnum.READ })
  notificationStatus: NotificationStatusEnum;

  @ApiProperty({ example: YnEnum.Y })
  isActive: YnEnum;

  @ApiProperty({ example: '2025-12-11 16:28:16' })
  createdAt: Date;
}
export class NotificationAppResDto {
  @ApiProperty({ example: 0 })
  seq: number;
  @ApiProperty({ example: '' })
  notificationId: string;
  @ApiProperty({ example: '' })
  messageId: string;
  @ApiProperty({ example: '' })
  title: string;
  @ApiProperty({ example: '' })
  body: string;
  @ApiProperty({ example: '' })
  data: string | any;
  @ApiProperty({ example: '' })
  targetScreen: string;
  @ApiProperty({ example: '' })
  userCode!: string;
  @ApiProperty({ example: '' })
  userCodesMuticast!: string[];
  @ApiProperty({ example: '' })
  topicCode!: string;
  @ApiProperty({ example: '' })
  notificationType: NotificationTypeEnum;
  @ApiProperty({ example: '' })
  notificationTypeLabel!: string;
  @ApiProperty({ example: '' })
  notificationStatus: NotificationStatusEnum;
  @ApiProperty({ example: YnEnum.N })
  isActive: YnEnum;
  @ApiProperty({ example: 'SINGLE' })
  notificationMethod!: string;
  @ApiProperty({ example: new Date() })
  createdAt: Date;
  @ApiProperty({ example: new Date() })
  updatedAt: Date;
  @ApiProperty({ example: '' })
  createdId: string;
  @ApiProperty({ example: '' })
  updatedId: string;
}
export class NotificationTopicAppResDto {
  @ApiProperty({ example: 0 })
  seq: number;
  @ApiProperty({ example: '' })
  topicCode: string;
  @ApiProperty({ example: '' })
  topicKeyword: string;
  @ApiProperty({ example: '' })
  topicName: string;
  @ApiProperty({ example: '' })
  topicDescription: string;
  @ApiProperty({ example: YnEnum.N })
  isActive: YnEnum;
  @ApiProperty({ example: new Date() })
  createdAt: Date;
  @ApiProperty({ example: new Date() })
  updatedAt: Date;
  @ApiProperty({ example: '' })
  createdId: string;
  @ApiProperty({ example: '' })
  updatedId: string;
}
export class UserNotificationTopicAppResDto {
  @ApiProperty({ example: 0 })
  seq: number;
  @ApiProperty({ example: '' })
  userCode: string;
  @ApiProperty({ example: '' })
  topicCode: string;
  @ApiProperty({ example: '' })
  topicName!: string;
  @ApiProperty({ example: YnEnum.N })
  isActive: YnEnum;
  @ApiProperty({ example: new Date() })
  createdAt: Date;
  @ApiProperty({ example: new Date() })
  updatedAt: Date;
  @ApiProperty({ example: '' })
  createdId: string;
  @ApiProperty({ example: '' })
  updatedId: string;
}
export class UserHomeProvinceForPushAppResDto {
  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  deviceToken: string;

  @ApiProperty({ example: '' })
  userHomeCode: string;

  @ApiProperty({ example: '' })
  userHomeProvince: string;
}
export class UserHomeForPushAppResDto {
  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  deviceToken: string;

  @ApiProperty({ example: '' })
  userHomeCode: string;
}
