import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoggingService } from 'src/common/logger/logger.service';
import { Msg } from 'src/helpers/message.helper';
import { ApiAppResponse } from 'src/interfaces/app.interface';
import { requestContextStorage } from 'src/middleware/ip.middleware';

// CHỈ HANDLE CASE SUCCESS
@Injectable()
export class ResponseAppInterceptor<T> implements NestInterceptor<T, ApiAppResponse<T>> {
  constructor(private readonly logger: LoggingService) { }
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiAppResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // lấy message ok (khi ko set message trong controller)
    function getOkDefaultMessage(method: string, url: string) {
      let defaultMessage = '';
      switch (method) {
        case 'GET': {
          defaultMessage = Msg.GetOk;
          break;
        }
        case 'POST': {
          if (url.includes('get')) {
            defaultMessage = Msg.GetOk;
          } else {
            defaultMessage = Msg.CreateOk;
          }
          break;
        }
        case 'PUT': {
          defaultMessage = Msg.UpdateOk;
          break;
        }
        case 'DELETE': {
          defaultMessage = Msg.DeleteOk;
          break;
        }
        default:
          defaultMessage = 'Success';
          break;
      }
      return defaultMessage;
    }
    // id unique của request
    const requestId = requestContextStorage.getStore()?.requestId;
    if (requestId) {
      response.setHeader('x-request-id', requestId);
    }

    return next.handle().pipe(
      map((data) => {
        // Trường hợp controller trả về object đã có success, message...
        if (data && typeof data === 'object' && 'success' in data) {
          return {
            ...data,
            statusCode: data?.statusCode || response.statusCode,
          };
        }

        if (data === null || data === undefined) {
          return {
            success: true,
            message: getOkDefaultMessage(request.method, request.url),
            data: null,
            statusCode: response.statusCode,
          };
        }

        // Trường hợp SUCCESS mặc định
        return {
          success: true,
          message: data?.message || getOkDefaultMessage(request.method, request.url),
          data: data?.data ?? data,
          statusCode: response.statusCode,
        };
      }),
    );
  }
}

