import { Injectable, OnModuleInit } from '@nestjs/common';
import admin from 'firebase-admin';
import serviceAccountJson from '../../../firebase-adminsdk.json'; // JSON từ Firebase
import { LoggingService } from '../logger/logger.service';
import { PushDataPayload } from './firebase.interface';
import { ConfigService } from '@nestjs/config';
import { APP_SCREENS } from 'src/helpers/const.helper';
import { CreateNotificationDto } from 'src/modules/notification/app/notification.dto';
import { NotificationAppService } from 'src/modules/notification/app/notification.service';
import { NotificationTypeEnum } from 'src/modules/notification/notification.interface';
import { v4 as uuidv4 } from 'uuid';
import { UserNotificationTopicResDto } from "../../modules/notification/notification.response";

const serviceAccount = serviceAccountJson as any;

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly SERVICE_NAME = 'FirebaseService';
  private readonly IMAGE: {
    LOGO: string;
    DETAIL: string;
  };

  private fcmConfig(title: string, body: string) {
    return {
      android: {
        priority: 'high' as const,
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title,
              body,
            },
            sound: 'default' as const,
          },
        },
      },
    } as const;
  }
  private messaging: admin.messaging.Messaging;

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationAppService: NotificationAppService,
    private readonly logger: LoggingService,
  ) {
    const currentUrl = this.configService.get<string>('CURRENT_URL');
    this.IMAGE = {
      LOGO: `${currentUrl}/images/favicon.ico`, // ảnh nhỏ logo
      DETAIL: `${currentUrl}/images/favicon.ico`, // ảnh nội dung mở rộng
      // LOGO: `https://3fam.ai/images/favicon.ico`,
      // DETAIL: `https://3fam.ai/images/favicon.ico`,
    };
  }
  onModuleInit() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
    }
    this.messaging = admin.messaging();
  }

  getAppScreen(notificationType: NotificationTypeEnum): string {
    if (notificationType === 'TODO') {
      return APP_SCREENS.REMINDER_SCREEN;
    } else if (notificationType === 'ADMIN') {
      return APP_SCREENS.NOTIFICATION_SCREEN;
    } else if (notificationType === 'ADMIN_QR') {
      return APP_SCREENS.QR_SCREEN;
    }
    return APP_SCREENS.NOTIFICATION_SCREEN;
  }
  // Single device token (của bạn)
  async sendNotification(userCode: string, deviceToken: string, title: string, body: string, data?: any, notificationType: NotificationTypeEnum = NotificationTypeEnum.ADMIN): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/sendNotification`;
    if (!deviceToken) {
      this.logger.log(logbase, `Bỏ qua gửi thông báo cho user(${userCode}) vì deviceToken trống`);
      return 0;
    }
    const notificationId = uuidv4();

    // lấy số lượng các notify chưa được đọc của user hiện tại
    const count = await this.notificationAppService.getCntNotifyNotReadByUser(userCode);

    const dataPayload: PushDataPayload = {
      notificationId: notificationId,
      title,
      body,
      targetScreen: this.getAppScreen(notificationType),
      image_logo: this.IMAGE.LOGO,
      image_detail: this.IMAGE.DETAIL,
      data: JSON.stringify(data) ?? "",
      count: String(count),
    };

    // gửi bằng token
    const message: admin.messaging.Message = {
      token: deviceToken,
      notification: { title, body },
      data: dataPayload,
      ...this.fcmConfig(title, body),
    };

    try {
      const response = await this.messaging.send(message);
      console.log('response --> ', response);
      if (response) {
        const messageId = response.split('/messages/')[1]; // VD: projects/fam-b055e/messages/0:1765439199615028%3bad3e4c3bad3e4c --> 1765439199615028%3bad3e4c3bad3e4c
        const notificationDto: CreateNotificationDto = {
          notificationId: notificationId,
          messageId: messageId,
          title: title,
          body: body,
          targetScreen: this.getAppScreen(notificationType),
          data: data ?? null,
          userCode: userCode,
          userCodesMuticast: [],
          topicCode: null,
          notificationType: notificationType,
        };
        await this.notificationAppService.createNotification(notificationDto);
        this.logger.log(logbase, `Gửi thông báo  ${JSON.stringify(message)} cho ${deviceToken} thành công : ${JSON.stringify(response)}`);
      } else {
        this.logger.log(logbase, `Gửi thông báo  ${JSON.stringify(message)} cho ${deviceToken} thất bại : ${JSON.stringify(response)}`);
      }

      return 1;
    } catch (error) {
      console.log(error);
      // bắt các lỗi FCM phổ biến
      if (error.code === 'messaging/registration-token-not-registered' || error.code === 'messaging/invalid-registration-token') {
        this.logger.log(logbase, `Token không hợp lệ hoặc đã bị thu hồi, đang tiến hành xóa khỏi DB: ${deviceToken}`);
        await this.notificationAppService.clearInvalidDeviceToken(deviceToken);
        return 0;
      } else if (error.code === 'messaging/unregistered') {
        this.logger.log(logbase, `Token chưa được đăng ký: ${deviceToken}`);
        return 0;
      } else {
        // lỗi
        this.logger.error(logbase, `Gửi thông báo  ${JSON.stringify(message)} cho ${deviceToken} thất bại ---> ${JSON.stringify(error)}`);
        return 0;
      }
    }
  }

  //  Gửi theo topic
  async sendNotificationToTopic(topic: string, title: string, body: string, data?: any, notificationType: NotificationTypeEnum = NotificationTypeEnum.ADMIN): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/sendNotificationToTopic`;
    const notificationId = uuidv4();

    const dataPayload: PushDataPayload = {
      notificationId,
      title,
      body,
      targetScreen: this.getAppScreen(notificationType),
      image_logo: this.IMAGE.LOGO,
      image_detail: this.IMAGE.DETAIL,
      data: JSON.stringify(data) ?? "",
      count: '0',
    };

    const message: admin.messaging.Message = {
      topic,
      notification: { title, body },
      data: dataPayload,
      ...this.fcmConfig(title, body),
    };
    console.log('message -->', message);

    try {
      const response = await this.messaging.send(message);

      this.logger.log(logbase, `Gửi thông báo đến topic (${topic}) thành công: (${JSON.stringify(response)})`);

      // Lưu vào DB
      const notificationDto: CreateNotificationDto = {
        notificationId,
        messageId: response.includes('/messages/') ? response.split('/messages/')[1] : response,
        title,
        body,
        targetScreen: this.getAppScreen(notificationType),
        data: data ?? null,
        userCode: null, // null vì gửi theo topic
        userCodesMuticast: [],
        topicCode: topic, // lưu lại topic để trace
        notificationType,
      };

      await this.notificationAppService.createNotification(notificationDto);

      return 1;
    } catch (error: any) {
      this.logger.log(logbase, `Gửi thông báo theo topic (${topic}) thất bại: (${JSON.stringify(error)}) `);

      // Xử lý các lỗi FCM phổ biến khi gửi topic
      if (error.code === 'messaging/topic-not-found' || error.code === 'messaging/invalid-argument') {
        this.logger.error(logbase, `Topic không tồn tại: [${topic}] thất bại`);
      }

      return 0;
    }
  }

  //  Gửi cho nhiều device tokens (multicast)
  async sendNotificationToMulticast(
    userDeviceTokens: { userCode: string; deviceToken: string }[],
    title: string,
    body: string,
    data?: any,
    notificationType: NotificationTypeEnum = NotificationTypeEnum.ADMIN,
  ): Promise<number> {
    const tokens = [...new Set(userDeviceTokens.map((ele) => ele.deviceToken).filter(token => !!token))]; // BỎ TRÙNG LẶP VÀ TOKEN TRỐNG
    const userCodes = userDeviceTokens.map((ele) => ele.userCode);

    console.log('tokens --> ', tokens);
    console.log('userCodes --> ', userCodes);

    if (tokens.length === 0) return 0;

    const logbase = `${this.SERVICE_NAME}/sendNotificationToMultipleTokens`;

    const notificationId = uuidv4();

    const dataPayload: PushDataPayload = {
      notificationId,
      title,
      body,
      targetScreen: this.getAppScreen(notificationType),
      image_logo: this.IMAGE.LOGO,
      image_detail: this.IMAGE.DETAIL,
      data: JSON.stringify(data) ?? "",
      count: '0',
    };

    let totalSuccessCount = 0;
    let totalFailureCount = 0;
    const BATCH_SIZE = 500; // FCM giới hạn gửi tối đa 500 token mỗi lần

    // Chia mảng token lớn thành từng khối (chunk) nhỏ
    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      const tokenBatch = tokens.slice(i, i + BATCH_SIZE);
      const message: admin.messaging.MulticastMessage = {
        tokens: tokenBatch,
        notification: { title, body },
        data: dataPayload,
        ...this.fcmConfig(title, body),
      };

      try {
        const batchResponse = await this.messaging.sendEachForMulticast(message);
        
        totalSuccessCount += batchResponse.successCount;
        totalFailureCount += batchResponse.failureCount;

        if (batchResponse.failureCount > 0) {
          const cleanupPromises = batchResponse.responses.map(async (resp, index) => {
            if (!resp.success && resp.error) {
              const failedToken = tokenBatch[index];
              const errorCode = resp.error.code || 'unknown';
              const errorMessage = resp.error.message || 'No message';

              // Tự động xóa token nếu bị báo không tồn tại hoặc không hợp lệ
              if (errorCode === 'messaging/registration-token-not-registered' || errorCode === 'messaging/invalid-registration-token') {
                await this.notificationAppService.clearInvalidDeviceToken(failedToken);
              }

              this.logger.error(logbase, `Token thất bại [${i + index}] | Token: ${failedToken.substring(0, 30)}... | Error: ${errorCode} - ${errorMessage}`);
            }
          });
          await Promise.all(cleanupPromises);
        }
      } catch (error) {
        this.logger.error(logbase, `Gửi thông báo batch ${i / BATCH_SIZE + 1} multicast thất bại: (${JSON.stringify(error)}) `);
      }
    }

    this.logger.log(logbase, `Gửi thông báo multicast hoàn tất | Tổng ${tokens.length} | Thành công: ${totalSuccessCount} | Thất bại: ${totalFailureCount}`);

    // insert những thông báo thành công vào DB
    if (totalSuccessCount > 0) {
      this.logger.log(logbase, `Có ${totalSuccessCount} token nhận thông báo multicast thành công`);
      // Lưu vào DB
      const notificationDto: CreateNotificationDto = {
        notificationId,
        messageId: 'mutilcast',
        title,
        body,
        targetScreen: this.getAppScreen(notificationType),
        data: data ?? null,
        userCode: null, // null vì gửi theo multicast
        userCodesMuticast: [...new Set(userCodes)], // Tránh lưu danh sách user bị trùng lặp
        topicCode: null, // ko gửi bằng topic
        notificationType,
      };

      await this.notificationAppService.createNotification(notificationDto);
    }
    
    return totalSuccessCount;
  }

  // todo: Khi tạo 1 topic nào đó nên tự động đăng kí topic đó cho tất cả user
  async subscribeToTopic(userCode: string, deviceToken: string, isNewOrChange: boolean) {
    const logbase = `${this.SERVICE_NAME}/subscribeToTopic: Device Token có thay đổi ? (${isNewOrChange}) `;

    // lấy topics đã đang đăng ký của user này
    const existingSubs = await this.notificationAppService.getUserSubscribedTopics(userCode);
    // lấy tất cả topics
    const { list: allTopics } = await this.notificationAppService.getAllTopic();

    // lọc ra các topic chưa đăng ký
    const missingTopics = allTopics.filter((topic) => !existingSubs.some((sub: UserNotificationTopicResDto) => sub.topicCode === topic.topicCode));

    // đăng ký tất cả topic cho device token mới
    if (isNewOrChange) {
      if (!deviceToken) {
        this.logger.log(logbase, `Bỏ qua subscribeToTopic cho user(${userCode}) vì deviceToken trống`);
        return;
      }
      //  subscribe tất cả topic ( FCM )
      for (const topic of allTopics) {
        const response = await admin.messaging().subscribeToTopic(deviceToken, topic.topicCode);
        if (response.failureCount > 0) {
          this.logger.error(logbase, `Đăng ký TOPIC PUSH(${topic.topicName}) cho người dùng (${userCode}) thất bại --> (${JSON.stringify(response)})`);
        }
        if (response.successCount > 0) {
          this.logger.log(logbase, `Đăng ký TOPIC PUSH(${topic.topicName}) cho người dùng (${userCode}) thành công`);
        }
      }
    } else {
      if (missingTopics.length === 0) {
        this.logger.log(logbase, `Người dùng  ${userCode} đã subscribe đủ topic rồi`);
      }

      if (!deviceToken) {
        this.logger.log(logbase, `Bỏ qua subscribeToTopic (missingTopics) cho user(${userCode}) vì deviceToken trống`);
      } else {
        // Chỉ subscribe những topic còn thiếu ( FCM )
        for (const topic of missingTopics) {
          const response = await admin.messaging().subscribeToTopic(deviceToken, topic.topicCode);
          if (response.failureCount > 0) {
            this.logger.error(logbase, `Đăng ký TOPIC PUSH(${topic.topicName}) cho người dùng (${userCode}) thất bại --> (${JSON.stringify(response)})`);
          }
          if (response.successCount > 0) {
            this.logger.log(logbase, `Đăng ký TOPIC PUSH(${topic.topicName}) cho người dùng (${userCode}) thành công`);
          }
        }
      }
    }

    // Chỉ subscribe những topic còn thiếu ( DB )
    for (const topic of missingTopics) {
      await this.notificationAppService.subscribeToTopic(userCode, topic.topicCode);
    }
  }

  // Unsubscribe
  async unsubscribeFromTopic(userCode: string, deviceToken: string) {
    const logbase = `${this.SERVICE_NAME}/unsubscribeFromTopic`;

    // lấy topics đã đang đăng ký của user này
    const existingSubs = await this.notificationAppService.getUserSubscribedTopics(userCode);

    // Chỉ unsubscribe những topic đã đăng ký ( FCM )
    if (!deviceToken) {
      this.logger.log(logbase, `Bỏ qua unsubscribeFromTopic cho user(${userCode}) vì deviceToken trống`);
      return;
    }

    for (const topic of existingSubs) {
      const response = await admin.messaging().unsubscribeFromTopic(deviceToken, topic.topicCode);
      if (response.failureCount > 0) {
        this.logger.error(logbase, `Hủy đăng ký TOPIC PUSH(${topic.topicName}) tự động cho người dùng (${userCode}) thất bại --> ${JSON.stringify(response.errors[0].error)}`);
      }
      if (response.successCount > 0) {
        this.logger.log(logbase, `Hủy đăng ký TOPIC PUSH(${topic.topicName}) tự động cho người dùng (${userCode}) thành công`);
      }
    }
  }

}
