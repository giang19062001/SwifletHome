import { Injectable, OnModuleInit } from '@nestjs/common';
import admin from 'firebase-admin';
import serviceAccountJson from '../../../firebase-adminsdk.json'; // JSON từ Firebase
import { MulticastMessage } from 'firebase-admin/messaging';
import { LoggingService } from '../logger/logger.service';
import { PushDataPayload } from './firebase.interface';
import { NotificationAppRepository } from 'src/modules/notification/app/notification.repository';
import { CreateNotificationDto } from 'src/modules/notification/app/notification.dto';
import { v4 as uuidv4 } from 'uuid';
import { IUserNotificationTopic, NotificationStatusEnum, NotificationTypeEnum } from 'src/modules/notification/notification.interface';
const serviceAccount = serviceAccountJson as any;

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly SERVICE_NAME = 'FirebaseService';
  private readonly IMAGE = {
    LOGO: 'https://3fam.ai/images/favicon.ico',
    DETAIL: 'https://3fam.ai/images/favicon.ico',
  };
  private messaging: admin.messaging.Messaging;

  constructor(
    private readonly notificationAppRepository: NotificationAppRepository,
    private readonly logger: LoggingService,
  ) {}
  onModuleInit() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
    }
    this.messaging = admin.messaging();
  }

  // Single device token (của bạn)
  async sendNotification(userCode: string, deviceToken: string, title: string, body: string, data?: any, notificationType?: NotificationTypeEnum) {
    const logbase = `${this.SERVICE_NAME}/sendNotification`;
    const notificationId = uuidv4();

    // lấy số lượng các notify chưa được đọc của user hiện tại
    const count = await this.notificationAppRepository.getCntNotifyNotReadByUser(userCode);

    const dataPayload: PushDataPayload = {
      notificationId: notificationId,
      title,
      body,
      image_logo: this.IMAGE.LOGO,
      image_detail: this.IMAGE.DETAIL,
      count: String(count),
    };

    // gửi bằng token
    const message: admin.messaging.Message = {
      token: deviceToken,
      notification: { title, body },
      data: dataPayload,
    };

    try {
      const response = await this.messaging.send(message);

      if (response) {
        const messageId = response.split('/messages/')[1]; // VD: projects/fam-b055e/messages/0:1765439199615028%3bad3e4c3bad3e4c --> 1765439199615028%3bad3e4c3bad3e4c
        const notificationDto: CreateNotificationDto = {
          notificationId: notificationId,
          messageId: messageId,
          title: title,
          body: title,
          data: data ?? null,
          userCode: userCode,
          topicCode: null,
          notificationType: notificationType ? notificationType : NotificationTypeEnum.ADMIN,
          notificationStatus: NotificationStatusEnum.SENT,
        };
        await this.notificationAppRepository.createNotification(notificationDto);
        this.logger.log(logbase, `Gửi thông báo  ${JSON.stringify(message)} cho ${deviceToken} thành công : ${JSON.stringify(response)}`);
      } else {
        this.logger.log(logbase, `Gửi thông báo  ${JSON.stringify(message)} cho ${deviceToken} thất bại : ${JSON.stringify(response)}`);
      }

      return response;
    } catch (error) {
      // bắt các lỗi FCM phổ biến
      if (error.code === 'messaging/registration-token-not-registered' || error.code === 'messaging/invalid-registration-token') {
        this.logger.log(logbase, `Token không hợp lệ hoặc đã bị thu hồi: ${deviceToken}`);
        return;
      } else if (error.code === 'messaging/unregistered') {
        this.logger.log(logbase, `Token chưa được đăng ký: ${deviceToken}`);
        return;
      } else {
        // lỗi
        this.logger.error(logbase, `Gửi thông báo  ${JSON.stringify(message)} cho ${deviceToken} thất bại ---> ${JSON.stringify(error)}`);
        return;
      }
    }
  }

  // todo: Khi tạo 1 topic nào đó nên tự động đăng kí topic đó cho tất cả user
  async subscribeToTopic(userCode: string, deviceToken: string) {
    const logbase = `${this.SERVICE_NAME}/subscribeToTopic`;

    // lấy topics đã đang đăng ký của user này
    const existingSubs = await this.notificationAppRepository.getUserSubscribedTopics(userCode);
    // lấy tất cả topics
    const allTopics = await this.notificationAppRepository.getAllTopic({ limit: 0, page: 0 });

    // lọc ra các topic chưa đăng ký
    const missingTopics = allTopics.filter((topic) => !existingSubs.some((sub: IUserNotificationTopic) => sub.topicCode === topic.topicCode));

    if (missingTopics.length === 0) {
      this.logger.log(logbase, `Người dùng  ${userCode} đã subscribe đủ topic rồi`);
    }

    
    // Chỉ subscribe những topic còn thiếu ( FCM )
    for (const topic of missingTopics) {
      const response = await admin.messaging().subscribeToTopic(deviceToken, topic.topicCode);
      if (response.failureCount > 0) {
        this.logger.error(logbase, `Đăng ký TOPIC PUSH(${topic.topicName}) cho người dùng (${userCode}) thất bại`);
      }
      if (response.successCount > 0) {
        this.logger.log(logbase, `Đăng ký TOPIC PUSH(${topic.topicName}) cho người dùng (${userCode}) thành công`);
      }
    }

    // Chỉ subscribe những topic còn thiếu ( DB )
    for (const topic of missingTopics) {
      await this.notificationAppRepository.subscribeToTopic(userCode, topic.topicCode);
    }
  }

  // Unsubscribe
  async unsubscribeFromTopic(userCode: string, deviceToken: string) {
    const logbase = `${this.SERVICE_NAME}/unsubscribeFromTopic`;

    // lấy topics đã đang đăng ký của user này
    const existingSubs = await this.notificationAppRepository.getUserSubscribedTopics(userCode);

    // Chỉ unsubscribe những topic đã đăng ký ( FCM )
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

  //  Gửi theo topic
  // async sendNotificationToTopic(topic: string, title: string, body: string, data?: any) {
  //   const message: admin.messaging.Message = {
  //     topic, //  topic
  //     notification: { title, body },
  //     data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : undefined, // data object muốn app nhận => ko hiện ra thông báo
  //   };

  //   try {
  //     const response = await this.messaging.send(message);
  //     console.log(`Gửi theo topic thành công ${topic}:`, response);
  //     return response;
  //   } catch (error) {
  //     console.error('Gửi theo topic thất bại:', error);
  //     throw error;
  //   }
  // }

  //  Gửi cho nhiều device tokens (multicast)
  // async sendNotificationToMultipleTokens(tokens: string[], title: string, body: string, data?: any) {
  //   if (tokens.length === 0) return;

  //   const message: MulticastMessage = {
  //     tokens, // mảng tokens
  //     notification: { title, body },
  //     data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : undefined, // data object muốn app nhận => ko hiện ra thông báo
  //   };

  //   try {
  //     const response = await this.messaging.sendEachForMulticast(message);
  //     console.log(`Gửi multicast thành công: ${response.successCount}/${tokens.length}`);
  //     return response;
  //   } catch (error) {
  //     console.error('Gửi multicast thất bại:', error);
  //     throw error;
  //   }
  // }
  // // Lấy danh sách token của 1 topic
  // async getTokensByTopic(topic: string): Promise<string[]> {
  //   const query = `
  //     SELECT fcm_token
  //     FROM topic_subscription
  //     WHERE topic = ?
  //   `;

  //   // const results = await this.dataSource.query<{ fcm_token: string }[]>(query, [topic]);
  //   // return results.map((r) => r.fcm_token);
  //   return [''];
  // }

  // // Lấy tất cả topic + số lượng subscriber
  // async getAllTopicsWithCounts(): Promise<{ topic: string; count: number }[]> {
  //   const query = `
  //     SELECT topic, COUNT(*) AS count
  //     FROM topic_subscription
  //     GROUP BY topic
  //     ORDER BY count DESC
  //   `;

  //   // const results = await this.dataSource.query<{ topic: string; count: string }[]>(query);
  //   // return results.map((r) => ({
  //   //   topic: r.topic,
  //   //   count: Number(r.count),
  //   // }));
  //   return [{ topic: '', count: 0 }];
  // }

  // // 5ấy danh sách topic mà 1 token đang subscribe
  // async getTopicsByToken(fcmToken: string): Promise<string[]> {
  //   const query = `
  //     SELECT topic
  //     FROM topic_subscription
  //     WHERE fcm_token = ?
  //   `;

  //   // const results = await this.dataSource.query<{ topic: string }[]>(query, [fcmToken]);
  //   // return results.map((r) => r.topic);
  //   return [''];
  // }

  // // Xóa token khỏi tất cả topic (logout / refresh token)
  // async removeTokenFromAllTopics(fcmToken: string): Promise<void> {
  //   // Lấy danh sách topic hiện tại của token
  //   const topics = await this.getTopicsByToken(fcmToken);

  //   // Nếu có topic → unsubscribe trên FCM (batch max 1000 token/topic, ở đây chỉ 1 token nên ok)
  //   if (topics.length > 0) {
  //     // FCM cho phép unsubscribe 1 token khỏi nhiều topic cùng lúc
  //     for (const topic of topics) {
  //       await admin.messaging().unsubscribeFromTopic([fcmToken], topic);
  //     }
  //   }

  //   // Xóa toàn bộ record của token trong DB
  //   // await this.dataSource.query(`DELETE FROM topic_subscription WHERE fcm_token = ?`, [fcmToken]);
  // }
}
