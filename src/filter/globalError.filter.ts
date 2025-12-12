import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggingService } from 'src/common/logger/logger.service';

@Injectable()
@Catch()
export class GlobalErrorLoggerFilter implements ExceptionFilter {
  logbase = 'GlobalErrorLoggerFilter';
  constructor(private readonly logger: LoggingService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let responseBody: any = {};

    // HttpException (400, 404, 409, ...)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object') {
        message = (response as any).message || message;
      }

      responseBody = response;
    } else {
      // Lỗi ngoài dự kiến
      message = (exception as any)?.message || message;
    }

    // LOG LỖI
    this.logger.error(
      this.logbase,
      `SERVER ERROR ---> ${JSON.stringify({
        url: req.url,
        method: req.method,
        ip: req.ip,
        body: req.body,
        query: req.query,
        params: req.params,
        message: message,
        stack: (exception as any)?.stack,
      })}`,
    );

    throw exception;
  }
}
