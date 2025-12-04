import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    const contentType = req.headers['content-type'] || '';
    const logObj: any = {
      url: req.url,
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

    console.log('REQUEST:', JSON.stringify(logObj));

    return next.handle();
  }
}
