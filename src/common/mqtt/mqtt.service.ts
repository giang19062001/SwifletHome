import { Injectable, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { LoggingService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { ISensor, ISensorStatus } from '../socket/socket.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MqttService implements OnModuleInit, OnApplicationShutdown {
  private client: mqtt.MqttClient;
  private brokerUrl: string;

  // Topic cho dữ liệu cảm biến
  private readonly dataTopic = 'sensor/+/data';
  // Topic cho trạng thái online/offline
  private readonly statusTopic = 'sensor/+/status';

  private readonly SERVICE_NAME = 'MqttService';

  constructor(
    private readonly logger: LoggingService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    const MQTT_HOST = 'localhost';
    const MQTT_PORT = this.configService.get<string>('MQTT_PORT') || '1883';
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
      this.logger.log(this.SERVICE_NAME, `Kết nối MQTT ${this.brokerUrl} thành công!`);

      // Đăng ký cả 2 topic
      this.client.subscribe([this.dataTopic, this.statusTopic], (err) => {
        if (!err) {
          this.logger.log(this.SERVICE_NAME, `Đã đăng ký: ${this.dataTopic} và ${this.statusTopic}`);
        } else {
          this.logger.error(this.SERVICE_NAME, `Lỗi subscribe topic: ${err}`);
        }
      });
    });

    this.client.on('message', (topic, message) => {
      // Xử lý topic data: sensor/MAC-xxx-xxx/data
      const dataMatch = topic.match(/^sensor\/(.+)\/data$/);
      if (dataMatch) {
        const key = dataMatch[1]; // MAC-USR000001-HOM000003

        try {
          const payload = JSON.parse(message.toString());
          const sensorData: ISensor = {
            temperature: payload.temperature ?? 0,
            humidity: payload.humidity ?? 0,
            current: payload.current ?? 0,
            timestamp: Date.now(),
          };

          this.eventEmitter.emit('sensor.data.updated', {
            key,
            data: sensorData,
          });
        } catch (error) {
          this.logger.error(this.SERVICE_NAME, `Invalid MQTT payload: JSON.stringify(error)`);
        }
        return;
      }

      // Xử lý topic status: sensor/MAC-xxx-xxx/status
      const statusMatch = topic.match(/^sensor\/(.+)\/status$/);
      if (statusMatch) {
        const key = statusMatch[1];
        const status = message.toString().trim();

        if (status === 'online' || status === 'offline') {
          this.logger.log(this.SERVICE_NAME, `Thiết bị ${key} chuyển trạng thái: ${status.toUpperCase()}`);

          const payload: ISensorStatus = {
            key,
            status, // 'online' | 'offline'
            timestamp: Date.now(),
          };

          this.eventEmitter.emit('sensor.status.changed', payload);
        }
        return;
      }
    });

    this.client.on('reconnect', () => this.logger.warn(this.SERVICE_NAME, 'MQTT đang kết nối lại...'));
    this.client.on('offline', () => this.logger.error(this.SERVICE_NAME, 'MQTT broker offline'));
    this.client.on('error', (err) => this.logger.error(this.SERVICE_NAME, `MQTT error ${JSON.stringify(err)}`));
  }

  onApplicationShutdown() {
    if (this.client) {
      this.client.end();
      this.logger.log(this.SERVICE_NAME, 'Đã đóng kết nối MQTT');
    }
  }
}
