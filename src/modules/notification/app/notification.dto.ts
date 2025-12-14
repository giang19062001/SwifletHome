import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NotificationStatusEnum, NotificationTypeEnum } from '../notification.interface';

export class CreateNotificationDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  notificationId: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  messageId: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    example: null,
    required: false,
    nullable: true,
  })
  @IsOptional()
  data: any | null;

   @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  targetScreen: string;


  @ApiProperty({
    example: '',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  userCode: string | null;

  @ApiProperty({
    example: [],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  userCodesMuticast: string[];

  @ApiProperty({
    example: null,
    type: 'string',
    nullable: true,
    required: true,
  })
  @IsOptional()
  topicCode: string | null;

  @ApiProperty({
    example: 'ADMIN',
    enum: NotificationTypeEnum,
  })
  @IsNotEmpty()
  @IsEnum(NotificationTypeEnum)
  notificationType: NotificationTypeEnum;

  @ApiProperty({
    example: 'SENT',
    enum: NotificationStatusEnum,
  })
  @IsNotEmpty()
  @IsEnum(NotificationStatusEnum)
  notificationStatus: NotificationStatusEnum;
}
