export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseAppInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    return next.handle().pipe(
      map((data) => {
        if (data === undefined || data === null || data === 0) {
          return {
            success: false,
            message: 'Failed',
            data: null,
            statusCode: 400,
          
          };
        }

        if (data && typeof data === 'object' && 'success' in data) {
          return {
            ...data,
            statusCode: response.statusCode,
          
          };
        }

        return {
          success: true,
          message: data?.message || 'Success',
          data: data,
          statusCode: response.statusCode,
        };
      }),
    );
  }
}
