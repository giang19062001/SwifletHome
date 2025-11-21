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
  async subscribeToTopic(tokens: string | string[], topic: string): Promise<number> {
    // 1. Gọi FCM để đăng ký thật
    const fcmResponse = await admin.messaging().subscribeToTopic(tokens, topic);

    // 2. Lưu vào MySQL (dùng upsert để tránh duplicate)
    // const entities = tokens.map(token => {
    //   const entity = new TopicSubscription();
    //   entity.topic = topic;
    //   entity.fcm_token = token;
    //   return entity;
    // });

    // Dùng INSERT IGNORE hoặc upsert (tùy driver MySQL)
    // await this.topicRepo
    //   .createQueryBuilder()
    //   .insert()
    //   .into(TopicSubscription)
    //   .values(entities)
    //   .orIgnore() // MySQL: không lỗi nếu trùng unique key
    //   .orUpdate(['fcm_token'], ['topic', 'fcm_token']) // nếu dùng PostgreSQL
    //   .execute();

    console.log(`Subscribed ${fcmResponse.successCount}/${tokens.length} tokens to topic "${topic}"`);
    if (fcmResponse.failureCount > 0) {
      console.warn('FCM errors:', fcmResponse.errors);
    }

    return fcmResponse.successCount;
  }

  // Unsubscribe
  async unsubscribeFromTopic(tokens: string | string[], topic: string): Promise<number> {

    // 1. Gọi FCM
    const fcmResponse = await admin.messaging().unsubscribeFromTopic(tokens, topic);

    // 2. Xóa khỏi MySQL
    // await this.topicRepo.delete({
    //   topic,
    //   fcm_token: In(tokens),
    // });

    console.log(`Unsubscribed ${fcmResponse.successCount} tokens from topic "${topic}"`);
    return fcmResponse.successCount;
  }

  // Lấy danh sách token của 1 topic
  // async getTokensByTopic(topic: string): Promise<string[]> {
  //   const results = await this.topicRepo.find({
  //     where: { topic },
  //     select: ['fcm_token'],
  //   });
  //   return results.map(r => r.fcm_token);
  // }

  // Lấy tất cả topic + số lượng subscriber
  // async getAllTopicsWithCounts(): Promise<{ topic: string; count: number }[]> {
  //   const result = await this.topicRepo
  //     .createQueryBuilder()
  //     .select('topic')
  //     .addSelect('COUNT(*)', 'count')
  //     .groupBy('topic')
  //     .orderBy('count', 'DESC')
  //     .getRawMany();

  //   return result.map(r => ({
  //     topic: r.topic,
  //     count: Number(r.count),
  //   }));
  // }

  // Bonus: Lấy danh sách topic mà 1 token đang subscribe
  // async getTopicsByToken(fcmToken: string): Promise<string[]> {
  // const results = await this.topicRepo.find({
  //   where: { fcm_token: fcmToken },
  //   select: ['topic'],
  // });
  // return results.map(r => r.topic);
  // }

  // Bonus: Xóa token khỏi tất cả topic (khi user logout hoặc refresh token)
  // async removeTokenFromAllTopics(fcmToken: string): Promise<void> {
  // const topics = await this.getTopicsByToken(fcmToken);
  // if (topics.length > 0) {
  //   await admin.messaging().unsubscribeFromTopic([fcmToken], topics);
  // }
  // await this.topicRepo.delete({ fcm_token: fcmToken });
  // }
}
