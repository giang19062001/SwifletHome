import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ROUTER } from 'src/helpers/const.helper';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const url = request.url;

    // Chỉ tính rate limit cho các request API (có /api trong URL)
    if (!url.toLowerCase().includes(ROUTER.APP)) {
      return true;
    }

    return false;
  }
}
