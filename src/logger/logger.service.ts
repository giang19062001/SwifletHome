import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), format.errors({ stack: true }), format.splat(), format.json()),
      transports: [
        new transports.Console({
          format: format.combine(format.colorize(), format.simple()),
        }),
        new DailyRotateFile({
          filename: 'logs/%DATE%-info.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
        new DailyRotateFile({
          filename: 'logs/%DATE%-error.log',
          level: 'error',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });
  }
  warn(message: any, ...optionalParams: any[]) {
    throw new Error('Method not implemented.');
  }
  debug?(message: any, ...optionalParams: any[]) {
    throw new Error('Method not implemented.');
  }
  verbose?(message: any, ...optionalParams: any[]) {
    throw new Error('Method not implemented.');
  }
  fatal?(message: any, ...optionalParams: any[]) {
    throw new Error('Method not implemented.');
  }
  setLogLevels?(levels: LogLevel[]) {
    throw new Error('Method not implemented.');
  }

  log(message: string, context?: any) {
    let contextData: string | object | undefined = context;

    if (typeof context === 'object' && context !== null) {
      try {
        contextData = JSON.stringify(context);
      } catch (e) {
        contextData = '';
      }
    }

    this.logger.info(message, { context: contextData });
  }

  error(message: string, context?: any) {
    let contextData: string | object | undefined = context;

    if (typeof context === 'object' && context !== null) {
      try {
        contextData = JSON.stringify(context);
      } catch (e) {
        contextData = '[Serialization Error]';
      }
    }

    this.logger.error(message, { context: contextData });
  }
}
