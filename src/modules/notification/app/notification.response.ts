import { ApiProperty } from '@nestjs/swagger';
import { NotificationStatusEnum, NotificationTypeEnum } from '../notification.interface';
import { YnEnum } from 'src/interfaces/admin.interface';
import { IsArray } from 'class-validator';
import { APP_SCREENS } from 'src/helpers/const.helper';

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

  @ApiProperty({ example: APP_SCREENS.SCHEDULE_SCREEN })
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
