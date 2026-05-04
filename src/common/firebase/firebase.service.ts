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
    } else if (notificationType === 'ADMIN_CONSIGNMENT') {
      return APP_SCREENS.CONSIGNMENT_SCREEN;
    }
    return APP_SCREENS.NOTIFICATION_SCREEN;
  }
  // Single device token (của bạn)
  async sendNotification(userCode: string, deviceToken: string, title: string, body: string, data?: any, notificationType: NotificationTypeEnum = NotificationTypeEnum.ADMIN): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/sendNotification`;
    const notificationId = uuidv4();
    let messageId = 'no_push';

    if (!deviceToken) {
      this.logger.log(logbase, `Bỏ qua gửi thông báo đẩy cho user(${userCode}) vì deviceToken trống, chỉ lưu vào DB`);
    } else {
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
        if (response) {
          messageId = response.split('/messages/')[1] || response; 
          this.logger.log(logbase, `Gửi thông báo đẩy cho ${deviceToken} thành công : ${JSON.stringify(response)}`);
        }
      } catch (error) {
        // bắt các lỗi FCM phổ biến
        if (error.code === 'messaging/registration-token-not-registered' || error.code === 'messaging/invalid-registration-token') {
          this.logger.log(logbase, `Token không hợp lệ hoặc đã bị thu hồi, đang tiến hành xóa khỏi DB: ${deviceToken}`);
          await this.notificationAppService.clearInvalidDeviceToken(deviceToken);
        } else if (error.code === 'messaging/unregistered') {
          this.logger.log(logbase, `Token chưa được đăng ký, xóa khỏi DB: ${deviceToken}`);
          await this.notificationAppService.clearInvalidDeviceToken(deviceToken);
        } else {
          this.logger.error(logbase, `Gửi thông báo đẩy cho ${deviceToken} thất bại ---> ${JSON.stringify(error)}`);
        }
        messageId = 'push_failed';
      }
    }

    // LUÔN LƯU VÀO DB để hiển thị trong app (ngay cả khi push thất bại hoặc user đang đăng xuất)
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

    return 1;
  }

  //  Gửi theo topic
  async sendNotificationToTopic(topic: string, title: string, body: string, data?: any, notificationType: NotificationTypeEnum = NotificationTypeEnum.ADMIN): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/sendNotificationToTopic`;
    const notificationId = uuidv4();
    let messageId = 'no_push';

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

    try {
      const response = await this.messaging.send(message);
      messageId = response.includes('/messages/') ? response.split('/messages/')[1] : response;
      this.logger.log(logbase, `Gửi thông báo đến topic (${topic}) thành công: (${JSON.stringify(response)})`);
    } catch (error: any) {
      this.logger.log(logbase, `Gửi thông báo theo topic (${topic}) thất bại: (${JSON.stringify(error)}) `);
      // Xử lý các lỗi FCM phổ biến khi gửi topic
      if (error.code === 'messaging/topic-not-found' || error.code === 'messaging/invalid-argument') {
        this.logger.error(logbase, `Topic không tồn tại: [${topic}] thất bại`);
      }
      messageId = 'push_failed';
    }

    // Luôn Lưu vào DB
    const notificationDto: CreateNotificationDto = {
      notificationId,
      messageId,
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
  }

  //  Gửi cho nhiều device tokens (multicast)
  async sendNotificationToMulticast(
    userDeviceTokens: { userCode: string; deviceToken: string }[],
    title: string,
    body: string,
    data?: any,
    notificationType: NotificationTypeEnum = NotificationTypeEnum.ADMIN,
  ): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/sendNotificationToMulticast`;
    const userCodes = userDeviceTokens.map((ele) => ele.userCode);
    const tokens = [...new Set(userDeviceTokens.map((ele) => ele.deviceToken).filter(token => !!token))]; // BỎ TRÙNG LẶP VÀ TOKEN TRỐNG
    const notificationId = uuidv4();
    let messageId = 'multicast';

    if (tokens.length === 0) {
      this.logger.log(logbase, `Không có token hợp lệ để gửi multicast, chỉ lưu thông báo vào DB`);
      messageId = 'no_push';
    } else {
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

                this.logger.error(logbase, `Token thất bại [${i + index}] | Token: ${failedToken.substring(0, 30)}... | Error: ${errorCode} - ${errorMessage}`);

                // Nếu token không hợp lệ hoặc đã bị thu hồi → xóa khỏi DB để lần sau không gửi lại
                const invalidCodes = ['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'];
                if (invalidCodes.includes(errorCode)) {
                  this.logger.log(logbase, `Xóa token invalid khỏi DB: ${failedToken.substring(0, 20)}...`);
                  await this.notificationAppService.clearInvalidDeviceToken(failedToken);
                }
              }
            });
            await Promise.all(cleanupPromises);
          }
        } catch (error) {
          this.logger.error(logbase, `Gửi thông báo batch ${i / BATCH_SIZE + 1} multicast thất bại: (${JSON.stringify(error)}) `);
        }
      }

      this.logger.log(logbase, `Gửi thông báo multicast hoàn tất | Tổng ${tokens.length} | Thành công: ${totalSuccessCount} | Thất bại: ${totalFailureCount}`);
      if (totalSuccessCount === 0) messageId = 'push_failed';
    }

    // LUÔN LƯU VÀO DB bất kể có gửi push thành công hay không
    if (userCodes.length > 0) {
      const notificationDto: CreateNotificationDto = {
        notificationId,
        messageId,
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
    
    return 1;
  }


  // Subscribe user mới vào toàn bộ topic
  async subscribeToTopic(userCode: string, deviceToken: string) {
    const logbase = `${this.SERVICE_NAME}/subscribeToTopic`;

    if (!deviceToken) {
      this.logger.log(logbase, `Bỏ qua subscribeToTopic cho user(${userCode}) vì deviceToken trống`);
      return;
    }

    // Lấy tất cả topics
    const { list: allTopics } = await this.notificationAppService.getAllTopic();
    // Lấy topics đã đăng ký trong DB của user này (để sync)
    const existingSubs = await this.notificationAppService.getUserSubscribedTopics(userCode);

    // Subscribe toàn bộ topic cho user hiện tại
    // Nếu Firebase báo token không hợp lệ → xóa ngay khỏi DB để tránh gửi thông báo thất bại sau này
    let isTokenInvalid = false;
    await Promise.all(allTopics.map(async (topic) => {
      try {
        const response = await admin.messaging().subscribeToTopic(deviceToken, topic.topicCode);
        if (response.failureCount > 0) {
          const invalidCodes = ['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'];
          const hasInvalidToken = response.errors?.some(e => invalidCodes.includes(e.error?.code));
          if (hasInvalidToken) {
            isTokenInvalid = true;
            this.logger.error(logbase, `Token không hợp lệ khi subscribe topic(${topic.topicName}) cho user(${userCode}) → sẽ xóa khỏi DB`);
          } else {
            this.logger.error(logbase, `Đăng ký TOPIC PUSH(${topic.topicName}) cho người dùng (${userCode}) thất bại --> (${JSON.stringify(response)})`);
          }
        }
        if (response.successCount > 0) {
          this.logger.log(logbase, `Đăng ký TOPIC PUSH(${topic.topicName}) cho người dùng (${userCode}) thành công`);
        }
      } catch (error) {
        this.logger.error(logbase, `Lỗi khi đăng ký topic ${topic.topicCode}: ${error.message}`);
      }
    }));

    // Nếu phát hiện token invalid → xóa khỏi DB để admin gửi notify không bị lỗi
    if (isTokenInvalid) {
      this.logger.error(logbase, `Phát hiện token invalid, xóa deviceToken(${deviceToken.substring(0, 20)}...) của user(${userCode}) khỏi DB`);
      await this.notificationAppService.clearInvalidDeviceToken(deviceToken);
      return; // không cần sync DB topic nữa vì token đã bị xóa
    }

    // Sync DB - chỉ insert những topic còn thiếu
    const missingTopics = allTopics.filter((topic) => !existingSubs.some((sub: UserNotificationTopicResDto) => sub.topicCode === topic.topicCode));
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

    await Promise.all(existingSubs.map(async (topic) => {
      try {
        const response = await admin.messaging().unsubscribeFromTopic(deviceToken, topic.topicCode);
        if (response.failureCount > 0) {
          this.logger.error(logbase, `Hủy đăng ký TOPIC PUSH(${topic.topicName}) tự động cho người dùng (${userCode}) thất bại --> ${JSON.stringify(response.errors[0].error)}`);
        }
        if (response.successCount > 0) {
          this.logger.log(logbase, `Hủy đăng ký TOPIC PUSH(${topic.topicName}) tự động cho người dùng (${userCode}) thành công`);
        }
      } catch (error) {
        this.logger.error(logbase, `Lỗi khi hủy đăng ký topic ${topic.topicCode}: ${error.message}`);
      }
    }));
  }

}
