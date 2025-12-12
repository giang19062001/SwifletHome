import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Msg } from 'src/helpers/message.helper';
import { ApiAppResponse } from 'src/interfaces/app.interface';

@Injectable()
export class ResponseAppInterceptor<T> implements NestInterceptor<T, ApiAppResponse<T>> {
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

    // lấy message error (khi ko set message trong controller)
    function getErrDefaultMessage(method: string, url: string) {
      let defaultMessage = '';
      switch (method) {
        case 'GET': {
          defaultMessage = Msg.GetErr;
          break;
        }
        case 'POST': {
          if (url.includes('get')) {
            defaultMessage = Msg.GetErr;
          } else {
            defaultMessage = Msg.CreateErr;
          }
          break;
        }
        case 'PUT': {
          defaultMessage = Msg.UpdateErr;
          break;
        }
        case 'DELETE': {
          defaultMessage = Msg.DeleteErr;
          break;
        }
        default:
          defaultMessage = 'Internal server error';
          break;
      }
      return defaultMessage;
    }

    return next.handle().pipe(
      map((data) => {
        // Trường hợp controller trả về object đã có success, message...
        if (data && typeof data === 'object' && 'success' in data) {
          return {
            ...data,
            statusCode: response.statusCode,
          };
        }
        // Trường hợp data là 0, false vẫn coi là ok
        // if (data === 0 || data === false) {
        //   return {
        //     success: true,
        //     message: data?.message || getOkDefaultMessage(request.method, request.url),
        //     data: data ?? null,
        //     statusCode: response.statusCode,
        //   };
        // }
        if (data === null || data === undefined) {
          return {
            success: false,
            message: data?.message || getErrDefaultMessage(request.method, request.url),
            data: data ?? null,
            statusCode: 400, // bad request
          };
        }

        // Trường hợp bình thường
        return {
          success: true,
          message: data?.message || getOkDefaultMessage(request.method, request.url),
          data: data?.data ?? data,
          statusCode: response.statusCode,
        };
      }),

      // Bắt tất cả lỗi (throw Exception)-> format lại
      catchError((err) => {
        const statusCode = err?.status || err?.response?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;

        const message = err?.response?.message || err?.message || getErrDefaultMessage(request.method, request.url);

        // Nếu là mảng lỗi -> lấy hết
        const errorMessage = Array.isArray(message) ? message.join(', ') : message;

        return of({
          success: false,
          message: errorMessage,
          data: err?.response?.data ?? null,
          statusCode,
        });
      }),
    );
  }
}
