import { Injectable, NestMiddleware } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { NextFunction, Request, Response } from 'express';

export interface RequestContext {
  requestId: string;
  ip: string;
  userId?: string;
  userAgent: string;
  url: string;
  method: string;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

@Injectable()
export class IpMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const context: RequestContext = {
      requestId: (req.headers['x-request-id'] as string) || (req.headers['x-correlation-id'] as string) || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      url: req.baseUrl,
      method: req.method,
    };

    // Chạy phần còn lại của request trong context này
    requestContextStorage.run(context, () => {
      next();
    });
  }
}
