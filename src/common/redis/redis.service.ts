import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { LoggingService } from '../logger/logger.service';

@Injectable()
export class RedisService implements OnModuleInit, OnApplicationShutdown {
  private redisClient: Redis;
  private readonly SERVICE_NAME = 'RedisService';

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggingService,
  ) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST');
    const port = this.configService.get<number>('REDIS_PORT');

    this.redisClient = new Redis({
      host,
      port,
      maxRetriesPerRequest: null,
    });

    const logbase = `${this.SERVICE_NAME}/onModuleInit`;
    let loggedSuccess = false;
    const logSuccess = () => {
      if (!loggedSuccess) {
        loggedSuccess = true;
        this.logger.log(logbase, `Kết nối Redis thành công`);
        console.log(this.SERVICE_NAME, ` ==> Connect redis://${host}:${port} successfully`);
      }
    };

    this.redisClient.on('connect', logSuccess);
    this.redisClient.on('ready', logSuccess);

    this.redisClient.on('error', (error) => {
      this.logger.error(logbase, `Lỗi kết nối Redis: ${error.message}`);
      console.error(this.SERVICE_NAME, ` ==> Connect redis://${host}:${port} failed: ${error.message}`);
    });

    if (this.redisClient.status === 'ready' || this.redisClient.status === 'connect') {
      logSuccess();
    }
  }

  getClient(): Redis {
    return this.redisClient;
  }

  onApplicationShutdown() {
    if (this.redisClient) {
      this.redisClient.disconnect();
      console.log(this.SERVICE_NAME, 'Đã đóng kết nối Redis');
    }
  }
}
