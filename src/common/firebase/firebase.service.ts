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

  // Đăng ký một hoặc nhiều FCM token vào một topic
  async subscribeToTopic(tokens: string | string[], topic: string): Promise<number> {
    if (!tokens || (Array.isArray(tokens) && tokens.length === 0)) {
      throw new Error('Tokens không được để trống');
    }

    const tokenArray = Array.isArray(tokens) ? tokens : [tokens];

    // Lọc bỏ token rỗng/invalid
    const validTokens = tokenArray.filter(t => typeof t === 'string' && t.trim().length > 0);
    if (validTokens.length === 0) return 0;

    try {
      const response = await admin.messaging().subscribeToTopic(validTokens, topic);
      
      console.log(`Đã subscribe ${response.successCount} token vào topic "${topic}"`);
      if (response.failureCount > 0) {
        console.warn(`Lỗi subscribe ${response.failureCount} token:`, response.errors);
      }
      
      return response.successCount;
    } catch (error) {
      console.error('Subscribe topic thất bại:', error);
      throw error;
    }
  }

   // Gỡ một hoặc nhiều token khỏi topic
  async unsubscribeFromTopic(tokens: string | string[], topic: string): Promise<number> {
    if (!tokens || (Array.isArray(tokens) && tokens.length === 0)) {
      throw new Error('Tokens không được để trống');
    }

    const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
    const validTokens = tokenArray.filter(t => typeof t === 'string' && t.trim().length > 0);
    if (validTokens.length === 0) return 0;

    try {
      const response = await admin.messaging().unsubscribeFromTopic(validTokens, topic);
      
      console.log(`Đã unsubscribe ${response.successCount} token khỏi topic "${topic}"`);
      if (response.failureCount > 0) {
        console.warn(`Lỗi unsubscribe ${response.failureCount} token:`, response.errors);
      }
      
      return response.successCount;
    } catch (error) {
      console.error('Unsubscribe topic thất bại:', error);
      throw error;
    }
  }
}
