import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { winstonConfig } from 'src/config/logger';
import { createLogger, format, transports, Logger } from 'winston';
import * as fs from 'fs';

@Injectable()
export class LoggingService implements LoggerService {
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger(winstonConfig);
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

  log(message: string, context: any) {
    this.logger.info(message, { context: context });
  }

  error(message: string, context: any) {
    this.logger.error(message, { context: context });
  }
}
