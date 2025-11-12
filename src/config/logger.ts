import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export const winstonConfig = {
  level: 'info',
  format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), format.errors({ stack: true }), format.splat(), format.json()),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message, context, stack }) => {
          let contextStr = '';

          if (context) {
            try {
              contextStr = typeof context === 'object' ? JSON.stringify(context, null, 2) : String(context);
            } catch {
              contextStr = '[Context Serialization Error]';
            }
          }

          return `${level}: [${timestamp}] [${message}]${contextStr ? ` CONTEXT: ${contextStr}` : ''}${stack ? ` STACK: ${stack}` : ''}`;
        }),
      ),
    }),
    new DailyRotateFile({
      filename: 'logs/%DATE%-info.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d', // TỒN TẠI 30 NGÀY KỂ CẢ .gz
    }),
    new DailyRotateFile({
      filename: 'logs/%DATE%-error.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d', // TỒN TẠI 30 NGÀY KỂ CẢ .gz
    }),
  ],
};
