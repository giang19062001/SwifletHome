import { Injectable, OnModuleInit } from '@nestjs/common';
import admin from 'firebase-admin';
import serviceAccountJson from '../../../firebase-adminsdk.json'; // JSON từ Firebase
import { MulticastMessage } from 'firebase-admin/messaging';
const serviceAccount = serviceAccountJson as any;

@Injectable()
export class FirebaseService implements OnModuleInit {
  private messaging: admin.messaging.Messaging;

  onModuleInit() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
    }
    this.messaging = admin.messaging();
  }

  // Single device token (của bạn)
  async sendNotification(deviceToken: string, title: string, body: string, data?: Record<string, string>) {
    const message: admin.messaging.Message = {
      token: deviceToken, // token
      notification: { title, body },
      data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : undefined, // data object muốn app nhận => ko hiện ra thông báo
    };

    try {
      const response = await this.messaging.send(message);
      console.log('Gửi theo token thành công:', response);
      return response;
    } catch (error) {
      console.error('Gửi theo token thất bại:', error);
      throw error;
    }
  }

  //  Gửi theo topic
  async sendNotificationToTopic(topic: string, title: string, body: string, data?: Record<string, string>) {
    const message: admin.messaging.Message = {
      topic, //  topic
      notification: { title, body },
      data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : undefined, // data object muốn app nhận => ko hiện ra thông báo
    };

    try {
      const response = await this.messaging.send(message);
      console.log(`Gửi theo topic thành công ${topic}:`, response);
      return response;
    } catch (error) {
      console.error('Gửi theo topic thất bại:', error);
      throw error;
    }
  }

  //  Gửi cho nhiều device tokens (multicast)
  async sendNotificationToMultipleTokens(tokens: string[], title: string, body: string, data?: Record<string, any>) {
    if (tokens.length === 0) return;

    const message: MulticastMessage = {
      tokens, // mảng tokens
      notification: { title, body },
      data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : undefined, // data object muốn app nhận => ko hiện ra thông báo
    };

    try {
      const response = await this.messaging.sendEachForMulticast(message);
      console.log(`Gửi multicast thành công: ${response.successCount}/${tokens.length}`);
      return response;
    } catch (error) {
      console.error('Gửi multicast thất bại:', error);
      throw error;
    }
  }
  // Subscribe 1 hoặc nhiều token vào topic
  // async subscribeToTopic(tokens: string | string[], topic: string): Promise<number> {
  //   const tokenArray = Array.isArray(tokens) ? tokens : [tokens];

  //   // Gọi FCM
  //   const fcmResponse = await admin.messaging().subscribeToTopic(tokenArray, topic);

  //   if (fcmResponse.failureCount > 0) {
  //     console.warn('FCM subscribe errors:', fcmResponse.errors);
  //   }

  //   // Lưu vào MySQL bằng INSERT IGNORE → không lỗi duplicate
  //   if (tokenArray.length > 0) {
  //     const valuesPlaceholder = tokenArray.map(() => `(?, ?)`).join(', ');

  //     const query = `
  //       INSERT IGNORE INTO topic_subscription (fcm_token, topic)
  //       VALUES ${valuesPlaceholder}
  //     `;

  //     const params: string[] = [];
  //     tokenArray.forEach((token) => {
  //       params.push(token, topic);
  //     });

  //     // await this.dataSource.query(query, params);
  //   }

  //   console.log(`Subscribed ${fcmResponse.successCount}/${tokenArray.length} tokens to topic "${topic}"`);
  //   return fcmResponse.successCount;
  // }

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
