import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as mqtt from 'mqtt';
import { LoggingService } from '../logger/logger.service';
import { ISensor } from '../socket/socket.interface';

@Injectable()
export class MqttService implements OnModuleInit, OnApplicationShutdown {
  private client: mqtt.MqttClient;
  private brokerUrl: string;
  private sensorTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly SENSOR_TIMEOUT_MS = 15_000; // 15s không nhận được telemetry -> TỰ ĐỘNG CHUYỂN OFFLINE

  // Topic duy nhất cần theo dõi dữ liệu cảm biến
  private readonly dataTopic = 'sensor/+/data';

  private readonly SERVICE_NAME = 'MqttService';

  constructor(
    private readonly logger: LoggingService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.brokerUrl = this.configService.get<string>('MQTT_URL') ?? '';
  }

  onModuleInit() {
    this.client = mqtt.connect(this.brokerUrl, {
      clientId: `${this.SERVICE_NAME}-${process.pid}-${Math.random().toString(16).slice(2, 8)}`,
      reconnectPeriod: 5000,
      connectTimeout: 30_000,
      keepalive: 60,
    });

    this.client.on('connect', () => {
      console.log(this.SERVICE_NAME, ` ==> Connect ${this.brokerUrl} successfully`);

      // Subscribe topic data
      this.client.subscribe(this.dataTopic, (err) => {
        if (!err) {
          console.log(this.SERVICE_NAME, ` ==> Subscribed: ${this.dataTopic}`);
        } else {
          this.logger.error(this.SERVICE_NAME, ` ==> Subscribe topic error: ${err}`);
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
            light: payload.light ?? 0,
            fan: payload.fan ?? 0,
            pump: payload.pump ?? 0,
            status: 'online',
            timestamp: Date.now(),
          };

          // Reset đếm ngược 15s Heartbeat
          this.updateSensorHeartbeat(key);

          // Bắn sự kiện dữ liệu cảm biến mới
          this.eventEmitter.emit('sensor.data.updated', {
            key,
            data: sensorData,
          });
        } catch (error) {
          this.logger.error(this.SERVICE_NAME, `Invalid MQTT payload: ${JSON.stringify(error)}`);
        }
        return;
      }
    });

    this.client.on('reconnect', () => this.logger.log(this.SERVICE_NAME, 'MQTT đang kết nối lại...'));
    this.client.on('offline', () => this.logger.error(this.SERVICE_NAME, 'MQTT broker offline'));
    this.client.on('error', (err) => this.logger.error(this.SERVICE_NAME, `MQTT error ${JSON.stringify(err)}`));
  }

  // Quản lý Heartbeat Timeout: Tự phát hiện offline dựa trên duy nhất sensorTimeouts Map
  private updateSensorHeartbeat(key: string) {
    const isFirstTimeOnline = !this.sensorTimeouts.has(key);

    if (this.sensorTimeouts.has(key)) {
      clearTimeout(this.sensorTimeouts.get(key));
    }

    // Nếu vừa mới online lại sau khi offline -> Cập nhật "online" lên MQTT Broker
    if (isFirstTimeOnline) {
      this.publishStatus(key, 'online').catch(() => {});
    }

    const timeout = setTimeout(() => {
      console.log(this.SERVICE_NAME, `Thiết bị ${key} quá 15s không gửi data -> CHUYỂN OFFLINE`);

      this.sensorTimeouts.delete(key);

      // Cập nhật "offline" lên MQTT Broker
      this.publishStatus(key, 'offline').catch(() => {});

      // Bắn sự kiện chuyển sang OFFLINE cho Socket Gateway
      this.eventEmitter.emit('sensor.status.changed', {
        key,
        status: 'offline',
        timestamp: Date.now(),
      });
    }, this.SENSOR_TIMEOUT_MS);

    this.sensorTimeouts.set(key, timeout);
  }

  // Lấy trạng thái hiện tại của thiết bị (Chỉ cần phụ thuộc sensorTimeouts)
  getDeviceStatus(key: string): ISensor {
    const isOnline = this.sensorTimeouts.has(key);
    return {
      temperature: 0,
      humidity: 0,
      current: 0,
      light: 0,
      fan: 0,
      pump: 0,
      status: isOnline ? 'online' : 'offline',
      timestamp: Date.now(),
    };
  }

  onApplicationShutdown() {
    this.sensorTimeouts.forEach((timer) => clearTimeout(timer));
    this.sensorTimeouts.clear();
    if (this.client) {
      this.client.end();
      console.log(this.SERVICE_NAME, 'Đã đóng kết nối MQTT');
    }
  }

  // Gửi lệnh điều khiển (Light / Fan / Pump) xuống cảm biến
  publishCommand(macId: string, payload: Record<string, any>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client || !this.client.connected) {
        return reject(new Error('MQTT client chưa sẵn sàng hoặc mất kết nối'));
      }
      const topic = `sensor/${macId}/command`;
      const message = JSON.stringify(payload);

      this.client.publish(topic, message, { qos: 0, retain: false }, (err) => {
        if (err) {
          this.logger.error(this.SERVICE_NAME, `Gửi lệnh MQTT thất bại: ${err.message}`);
          return reject(err);
        }
        console.log(this.SERVICE_NAME, `==> [COMMAND] Gửi lệnh thành công tới topic ${topic}: ${message}`);
        resolve();
      });
    });
  }

  // Phát trạng thái (online / offline) lên MQTT Broker
  publishStatus(macId: string, status: 'online' | 'offline'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client || !this.client.connected) {
        return resolve();
      }
      const topic = `sensor/${macId}/status`;

      this.client.publish(topic, status, { qos: 0, retain: true }, (err) => {
        if (err) {
          this.logger.error(this.SERVICE_NAME, `Cập nhật status MQTT thất bại: ${err.message}`);
          return resolve();
        }
        console.log(this.SERVICE_NAME, `==> [STATUS MQTT] Cập nhật ${topic} thành ${status}`);
        resolve();
      });
    });
  }
}
