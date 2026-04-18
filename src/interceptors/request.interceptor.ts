import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggingService } from 'src/common/logger/logger.service';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggingService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;

    // Chỉ bắt log các API của APP
    if (!url.includes('/api/app/')) {
      return next.handle();
    }
    const contentType = req.headers['content-type'] || '';
    const accessToken = req.headers['authorization'] || '';
    const logObj: any = {
      url: url,
      method: method,
      accessToken: accessToken,
    };

    // Params nếu có
    if (req.params && Object.keys(req.params).length > 0) {
      logObj.params = req.params;
    }

    // Query nếu có
    if (req.query && Object.keys(req.query).length > 0) {
      logObj.query = req.query;
    }

    // Body -> log nếu là JSON
    if (contentType.includes('application/json') && req.body) {
      logObj.body = req.body;
    }

    this.logger.log(`[REQUEST] ${method} ${url}`, logObj);

    return next.handle().pipe(
      tap((data) => {
        this.logger.log(`[RESPONSE] ${method} ${url}`, {
          url: url,
          method: method,
          response: data?.data || data?.message || "-",
        });
      }),
    );
  }
}

