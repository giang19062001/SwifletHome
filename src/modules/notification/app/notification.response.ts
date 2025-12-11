import { ApiProperty } from '@nestjs/swagger';
import { NotificationStatusEnum } from '../notification.interface';
import { YnEnum } from 'src/interfaces/admin.interface';

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

  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  topicCode: string | null;

  @ApiProperty({ example: NotificationStatusEnum.READ })
  status: NotificationStatusEnum;

  @ApiProperty({ example: YnEnum.Y })
  isActive: YnEnum;

  @ApiProperty({ example: '2025-12-11 16:28:16' })
  createdAt: Date;
}
