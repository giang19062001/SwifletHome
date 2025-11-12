import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiAppResponse } from 'src/interfaces/common';

@Injectable()
export class ResponseAppInterceptor<T>
  implements NestInterceptor<T, ApiAppResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiAppResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    // const request = ctx.getRequest();

    return next.handle().pipe(
      map((data) => {
        // Trường hợp controller trả về object đã có success, message...
        if (data && typeof data === 'object' && 'success' in data) {
          return {
            ...data,
            statusCode: response.statusCode,
          };
        }

        // Trường hợp data là null, undefined, 0, false,...
        if (data === null || data === undefined || data === 0 || data === false) {
          return {
            success: true, // vẫn coi là thành công nếu controller chủ động trả null/0
            message: data?.message || 'Success',
            data: data ?? null,
            statusCode: response.statusCode,
          };
        }

        // Trường hợp bình thường
        return {
          success: true,
          message: data?.message || 'Success',
          data: data?.['data'] ? data.data : data,
          statusCode: response.statusCode,
        };
      }),

      // Bắt tất cả lỗi (throw Exception) → format lại
      catchError((err) => {
        const statusCode =
          err?.status ||
          err?.response?.statusCode ||
          HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
          err?.response?.message ||
          err?.message ||
          'Internal server error';

        // Nếu là mảng lỗi (validation), lấy hết
        const errorMessage = Array.isArray(message)
          ? message.join(', ')
          : message;

        return of({
          success: false,
          message: errorMessage,
          data: null,
          statusCode,
        });
      }),
    );
  }
}