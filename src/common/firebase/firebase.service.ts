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
      data: data ? Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)])) : undefined, // data object muốn app nhận => ko hiện ra thông báo
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
}
