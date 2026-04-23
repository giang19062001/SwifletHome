import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const url = request.url;

    // Chỉ tính rate limit cho các request API (có /api trong URL)
    if (!url.toLowerCase().includes('/api/app')) {
      return true;
    }

    return false;
  }
}
