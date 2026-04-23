import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const url = request.url;

    // 1. Chỉ tính rate limit cho các request API (có /api trong URL)
    if (!url.toLowerCase().includes('/api')) {
      return true;
    }

    // 2. Bỏ qua các tệp media và file tĩnh (ảnh, audio, video, css, js, html, fonts, docs)
    const skipExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', // Images
      '.mp3', '.wav', '.ogg', '.m4a',                           // Audio
      '.mp4', '.webm', '.mov', '.avi',                          // Video
      '.css', '.js', '.html', '.htm',                           // Web files
      '.woff', '.woff2', '.ttf', '.eot',                        // Fonts
      '.pdf', '.doc', '.docx', '.xls', '.xlsx'                  // Documents
    ];

    if (skipExtensions.some((ext) => url.toLowerCase().split('?')[0].endsWith(ext))) {
      return true;
    }

    return false;
  }
}
