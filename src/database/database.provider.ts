import { ConfigService } from '@nestjs/config';
import mysql from 'mysql2/promise';

export const databaseProviders = {
  provide: 'MYSQL_CONNECTION',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const pool = mysql.createPool({
      host: configService.get('DB_HOST'),
      user: configService.get('DB_USER'),
      database: configService.get('DB_NAME'),
      password: configService.get('DB_PASSWORD'),
      port: configService.get<number>('DB_PORT'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: '+07:00', // VN
    });
    return pool;
  },
};
