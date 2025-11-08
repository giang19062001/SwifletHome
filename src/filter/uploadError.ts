import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { MsgErr } from 'src/helpers/message';

@Catch(BadRequestException)
export class MulterBadRequestFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.BAD_REQUEST;

    const originalMessage = exception.message;

    console.log(originalMessage);
    if (originalMessage === 'Too many files') {
      return response.status(status).json({
        statusCode: status,
        message: MsgErr.FileOvertake,
        error: 'Bad Request',
      });
    }
    throw exception;
  }
}