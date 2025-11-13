import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';


// log ghi trong file
const customFormat = format.printf(({ timestamp, level, message, context, stack }) => {
  const logEntry: any = {
    level,
    timestamp,
    caller: message,
    context
  };

  if (stack) {
    logEntry.stack = stack;
  }

  return JSON.stringify(logEntry);
});

export const winstonConfig = {
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    customFormat
  ),
  transports: [
    // log ghi trong console
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

          return `${level}: [${timestamp}]-[${message}]:\t${stack ? `${stack}` : `${contextStr}`}`;
        }),
      ),
    }),
    new DailyRotateFile({
      filename: 'logs/%DATE%-info.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
    }),
    new DailyRotateFile({
      filename: 'logs/%DATE%-error.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
  
  // Thêm exitOnError false để tránh crash app khi có lỗi ghi log
  exitOnError: false,
  
};