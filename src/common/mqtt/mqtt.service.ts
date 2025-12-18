import { Injectable, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { LoggingService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { ISensor } from '../socket/socket.interface';

@Injectable()
export class MqttService implements OnModuleInit, OnApplicationShutdown {
  private client: mqtt.MqttClient;
  private brokerUrl: string;
  private readonly topic = 'sensor/+/data'; // Dùng wildcard + để nhận từ nhiều sensor khác nhau
  private readonly SERVICE_NAME = 'MqttService';
  private latestSensorData = new Map<string, ISensor>(); // lưu tạm giá trị mới nhất
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
      // VD: sensor/MAC-USR000001-HOM000003/data
      const match = topic.match(/^sensor\/(.+)\/data$/);
      if (match) {
        const key = match[1]; //VD: MAC-USR000001-HOM000003

        try {
          const payload = JSON.parse(message.toString());
          const sensorData: ISensor = {
            temperature: payload.temperature ?? 0,
            humidity: payload.humidity ?? 0,
            current: payload.current ?? 0,
          };

          this.latestSensorData.set(key, sensorData);
          // console.log(`MQTT Updated [${key}]:`, sensorData);
        } catch (error) {
          console.error('Invalid MQTT payload:', message.toString());
        }
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
  // Phương thức lấy dữ liệu mới nhất theo key
  getLatestSensorData(key: string): ISensor {
    return (
      this.latestSensorData.get(key) || {
        temperature: 0,
        humidity: 0,
        current: 0,
      }
    );
  }
}
