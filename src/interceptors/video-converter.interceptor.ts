import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { extname } from 'path';
import * as fs from 'fs';
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

@Injectable()
export class VideoConverterInterceptor implements NestInterceptor {
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

    // Fix Safari bug: uploads .mp4 but sets mimetype to video/quicktime
    if (ext === '.mp4' && file.mimetype !== 'video/mp4') {
      file.mimetype = 'video/mp4';
      return;
    }

    // chỉ đổi sang .mp4 khi file là video và có .ext là .mov và .webm hoặc mimetype tương ứng
    if (ext === '.mov' || ext === '.webm' || file.mimetype === 'video/quicktime' || file.mimetype === 'video/webm') {
      const originalPath = file.path;
      const originalFilename = file.filename;

      const newFilename = originalFilename.replace(extname(originalFilename), '.mp4');
      const newPath = originalPath.replace(extname(originalPath), '.mp4');

      return new Promise<void>((resolve, reject) => {
        ffmpeg(originalPath)
          .output(newPath)
          .videoCodec('libx264')
          .audioCodec('aac')
          .on('end', () => {
            // xóa file gốc sau khi convert xong
            try {
              if (fs.existsSync(originalPath)) {
                fs.unlinkSync(originalPath);
              }
            } catch (e) {
              console.error('Error unlinking original file:', e);
            }

            // cập nhật lại thông tin file
            file.originalname = file.originalname.replace(new RegExp(ext + '$', 'i'), '.mp4');
            file.filename = newFilename;
            file.path = newPath;
            file.mimetype = 'video/mp4';

            try {
              const stats = fs.statSync(newPath);
              file.size = stats.size;
            } catch (e) {}

            resolve();
          })
          .on('error', (err) => {
            console.error('FFmpeg conversion error:', err);
            // báo lỗi
            resolve();
          })
          .run();
      });
    }
  }
}
