import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggingService } from 'src/common/logger/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggingService) { }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const errorResponse = exception instanceof HttpException ? exception.getResponse() : exception;

    // Lấy message chi tiết (đặc biệt cho ValidationPipe là mảng)
    let message = 'Internal server error';
    let detailData = null;

    if (typeof errorResponse === 'object' && errorResponse !== null) {
      const msg = (errorResponse as any).message || (errorResponse as any).error;
      message = Array.isArray(msg) ? msg.join(', ') : msg || exception.message || message;
      detailData = (errorResponse as any).data ?? (errorResponse as any).response?.data ?? null;
    } else {
      message = exception.message || message;
    }

    // GHI LOG
    this.logger.error(
      `[EXCEPTION] ${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
      {
        status,
        path: request.url,
        method: request.method,
        error: errorResponse,
      },
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      data: detailData,
      message: message,
    });
  }
}

