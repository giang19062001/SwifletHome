import { ApiProperty } from "@nestjs/swagger";
import { YnEnum } from "src/interfaces/admin.interface";
import { NotificationStatusEnum, NotificationTypeEnum } from "./notification.interface";

export class NotificationResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    notificationId: string;
    @ApiProperty({ example: '' })
    messageId: string;
    @ApiProperty({ example: '' })
    title: string;
    @ApiProperty({ example: '' })
    body: Text;
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
    @ApiProperty({ example: new Date() })
    createdAt: Date;
    @ApiProperty({ example: new Date() })
    updatedAt: Date;
    @ApiProperty({ example: '' })
    createdId: string;
    @ApiProperty({ example: '' })
    updatedId: string;
}

export class NotificationTopicResDto {
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

export class UserNotificationTopicResDto {
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

export class UserHomeProvinceForPushResDto {
    @ApiProperty({ example: '' })
    userCode: string;
    @ApiProperty({ example: '' })
    deviceToken: string;
    @ApiProperty({ example: '' })
    userHomeCode: string;
    @ApiProperty({ example: '' })
    userHomeProvince: string;
}

export class UserHomeForPushResDto {
    @ApiProperty({ example: '' })
    userCode: string;
    @ApiProperty({ example: '' })
    deviceToken: string;
    @ApiProperty({ example: '' })
    userHomeCode: string;
}
