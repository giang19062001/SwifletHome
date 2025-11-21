import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Msg } from 'src/helpers/message.helper';

@Catch(BadRequestException)
export class MulterBadRequestFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.BAD_REQUEST;

    const originalMessage = exception.message;

    // Lỗi từ Multer
    if (originalMessage === 'Too many files') {
      return response.status(status).json({
        statusCode: status,
        message: Msg.FileOvertake,
        error: 'Bad Request',
      });
    }
    throw exception;
  }
}