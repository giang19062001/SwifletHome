import { Injectable, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { LoggingService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MqttService implements OnModuleInit, OnApplicationShutdown {
  private client: mqtt.MqttClient;
  private brokerUrl: string;
  private readonly topic = 'sensor/+/data'; // Dùng wildcard + để nhận từ nhiều sensor khác nhau
  private readonly SERVICE_NAME = 'MqttService';

  constructor(
    private readonly logger: LoggingService,
    private readonly configService: ConfigService,
  ) {
    const MQTT_HOST = 'localhost';
    const MQTT_PORT = this.configService.get<string>('MQTT_PORT');
    this.brokerUrl = `mqtt://${MQTT_HOST}:${MQTT_PORT}`;
  }

  onModuleInit() {
    this.client = mqtt.connect(this.brokerUrl, {
      clientId: `${this.SERVICE_NAME}-${process.pid}-${Math.random().toString(16).slice(2, 8)}`,
      reconnectPeriod: 5000,
      connectTimeout: 30_000,
      keepalive: 60,
    });

    this.client.on('connect', () => {
      this.logger.log(this.SERVICE_NAME, `Kết nỗi MQTT ${this.brokerUrl} thành công!`);
      this.client.subscribe(this.topic, (err) => {
        if (!err) {
          this.logger.log(this.SERVICE_NAME, `đăng kí chủ đề chung: ${this.topic}`);
        }
      });
    });

    this.client.on('message', (topic, message) => {
      const payload = message.toString();

      try {
        const data = JSON.parse(payload);
        console.log('Dữ liệu:', topic, {
          temperature: data.temperature,
          humidity: data.humidity,
          current: data.current,
        });
      } catch (e) {
        console.error('Invalid JSON:', payload);
      }
    });

    this.client.on('reconnect', () => this.logger.warn('MQTT reconnecting...'));
    this.client.on('offline', () => this.logger.error('MQTT broker offline'));
    this.client.on('error', (err) => this.logger.error('MQTT error', err));
  }

  onApplicationShutdown() {
    if (this.client) {
      this.client.end();
    }
  }
}
