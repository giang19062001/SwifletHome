import { InjectQueue } from '@nestjs/bullmq';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Queue } from 'bullmq';
import { extname } from 'path';
import { Observable } from 'rxjs';

@Injectable()
export class VideoConverterInterceptor implements NestInterceptor {
  constructor(@InjectQueue('video') private readonly videoQueue: Queue) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    await this.processFiles(request);

    return next.handle();
  }

  private async processFiles(request: any): Promise<void> {
    const promises: Promise<void>[] = [];

    if (request.files) {
      if (Array.isArray(request.files)) {
        for (const file of request.files) {
          promises.push(this.convertIfNeeded(file));
        }
      } else {
        for (const field in request.files) {
          for (const file of request.files[field]) {
            promises.push(this.convertIfNeeded(file));
          }
        }
      }
    }

    if (request.file) {
      promises.push(this.convertIfNeeded(request.file));
    }

    await Promise.all(promises);
  }

  private async convertIfNeeded(file: any): Promise<void> {
    const ext = extname(file.originalname).toLowerCase();

    const isVideo = file.mimetype.startsWith('video/') || ext === '.mov' || ext === '.webm' || ext === '.mp4';

    if (isVideo) {
      const originalPath = file.path;
      const originalFilename = file.filename;

      const originalFilenameExt = extname(originalFilename);
      const baseFilename = originalFilenameExt ? originalFilename.slice(0, -originalFilenameExt.length) : originalFilename;
      const newFilename = baseFilename + '.mp4';

      const originalPathExt = extname(originalPath);
      const basePath = originalPathExt ? originalPath.slice(0, -originalPathExt.length) : originalPath;
      const newPath = basePath + '.mp4'; // Đường dẫn cuối cùng
      const tempPath = basePath + '-temp.mp4'; // Đường dẫn tạm để FFmpeg render

      // Đổi object file sang mp4
      const origExt = extname(file.originalname);
      const baseOriginal = origExt ? file.originalname.slice(0, -origExt.length) : file.originalname;
      file.originalname = baseOriginal + '.mp4';

      file.filename = newFilename;
      file.path = newPath;
      file.mimetype = 'video/mp4';

      // Đẩy job convert vào BullMQ để xử lý FFmpeg ngầm
      await this.videoQueue.add('convert', {
        originalPath,
        tempPath,
        newPath,
      });

      // Return liền không chờ FFMPEG chạy
      return Promise.resolve();
    }
  }
}
