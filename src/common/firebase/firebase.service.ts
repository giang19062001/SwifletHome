import { Injectable, OnModuleInit } from '@nestjs/common';
import admin from 'firebase-admin';
import serviceAccountJson from '../../../firebase-adminsdk.json'; // JSON từ Firebase
import { MulticastMessage } from 'firebase-admin/messaging';
import { NotificationAppRepository } from 'src/modules/notification/notification.repository';
import { LoggingService } from '../logger/logger.service';
import { IUserNotificationTopic } from 'src/modules/notification/notification.interface';
import { IFcmPayload } from './firebase.interface';
const serviceAccount = serviceAccountJson as any;

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly SERVICE_NAME = 'FirebaseService';
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
  async sendNotification(deviceToken: string, title: string, body: string, data?: IFcmPayload) {
    const logbase = `${this.SERVICE_NAME}/sendNotification`;

    const message: admin.messaging.Message = {
      token: deviceToken, // token
      notification: { title, body },
      data: data ? data : undefined, // data object muốn app nhận => ko hiện ra thông báo
    };

    try {
      const response = await this.messaging.send(message);
      this.logger.log(logbase, `Gửi thông báo  ${JSON.stringify(message)} cho ${deviceToken} thành công : ${JSON.stringify(response)}`);

      return response;
    } catch (error) {
      this.logger.log(logbase, `Gửi thông báo  ${JSON.stringify(message)} cho ${deviceToken} thất bại: ${JSON.stringify(error)}`);

      throw error;
    }
  }

  //  Gửi theo topic
  // async sendNotificationToTopic(topic: string, title: string, body: string, data?: IFcmPayload) {
  //   const message: admin.messaging.Message = {
  //     topic, //  topic
  //     notification: { title, body },
  //     data: data ? data : undefined, // data object muốn app nhận => ko hiện ra thông báo
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
  // async sendNotificationToMultipleTokens(tokens: string[], title: string, body: string, data?: IFcmPayload) {
  //   if (tokens.length === 0) return;

  //   const message: MulticastMessage = {
  //     tokens, // mảng tokens
  //     notification: { title, body },
  //     data: data ? data : undefined, // data object muốn app nhận => ko hiện ra thông báo
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
      return 1;
    }

    // Chỉ subscribe những topic còn thiếu ( FCM )
    for (const topic of missingTopics) {
      const fcmResponse = await admin.messaging().subscribeToTopic(deviceToken, topic.topicCode);
      console.log(fcmResponse);
      if (fcmResponse.failureCount > 0) {
        this.logger.error(logbase, `Đăng ký ${topic.topicName} tự động cho người dùng đăng kí mới (${userCode}) thất bại`);
      }
      if (fcmResponse.successCount > 0) {
        this.logger.log(logbase, `Đăng ký ${topic.topicName} tự động cho người dùng đăng kí mới (${userCode}) thành công`);
      }
    }

    // Chỉ subscribe những topic còn thiếu ( DB )
    for (const topic of missingTopics) {
      await this.notificationAppRepository.subscribeToTopic(userCode, topic.topicCode);
    }
    return 1;
  }

  // // Unsubscribe
  // async unsubscribeFromTopic(tokens: string | string[], topic: string): Promise<number> {
  //   const tokenArray = Array.isArray(tokens) ? tokens : [tokens];

  //   // Gọi FCM
  //   const fcmResponse = await admin.messaging().unsubscribeFromTopic(tokenArray, topic);

  //   // Xóa khỏi DB
  //   if (tokenArray.length > 0) {
  //     const placeholders = tokenArray.map(() => '?').join(', ');
  //     const query = `
  //       DELETE FROM topic_subscription
  //       WHERE topic = ? AND fcm_token IN (${placeholders})
  //     `;

  //     // await this.dataSource.query(query, [topic, ...tokenArray]);
  //   }

  //   console.log(`Unsubscribed ${fcmResponse.successCount}/${tokenArray.length} tokens from topic "${topic}"`);
  //   return fcmResponse.successCount;
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
