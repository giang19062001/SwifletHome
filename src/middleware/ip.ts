import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  requestId: string;
  ip: string;
  userId?: string;
  userAgent: string;
  path: string;
  method: string;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

@Injectable()
export class IpMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const context: RequestContext = {
      requestId: (req.headers['x-request-id'] as string) || Math.random().toString(36),
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      path: req.path,
      method: req.method,
    };

    // Chạy phần còn lại của request trong context này
    requestContextStorage.run(context, () => {
      next();
    });
  }
}
