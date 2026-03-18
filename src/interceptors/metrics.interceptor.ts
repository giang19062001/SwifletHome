import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Counter, Histogram } from 'prom-client';
import { getToken } from 'nestjs-prometheus';
import { Inject } from '@nestjs/common';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(
    // + số lần request cho API hiện tại
    @Inject(getToken('http_requests_total')) private readonly countMetric: Counter<string>,
  ) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, path } = request;

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

        this.countMetric.labels(method, path, statusCode.toString()).inc();
      }),
    );
  }
}
