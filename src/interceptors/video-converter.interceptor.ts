import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import { extname } from 'path';
import { Observable } from 'rxjs';
import { FFMPEG_OPTIONS } from 'src/config/ffmpeg.config';

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}
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
    if (ext === '.mp4') {
      if (file.mimetype !== 'video/mp4') {
        file.mimetype = 'video/mp4';
      }
      return; // Bỏ qua convert vì đã là mp4
    }

    // Chỉ đổi sang .mp4 khi chắc chắn file là video (dựa vào mimetype HOẶC đuôi file) VÀ không phải là .mp4
    const isVideo = file.mimetype.startsWith('video/') || ext === '.mov' || ext === '.webm';

    if (isVideo && ext !== '.mp4') {
      const originalPath = file.path;
      const originalFilename = file.filename;

      const originalFilenameExt = extname(originalFilename);
      const newFilename = originalFilenameExt ? originalFilename.slice(0, -originalFilenameExt.length) + '.mp4' : originalFilename + '.mp4';

      const originalPathExt = extname(originalPath);
      const newPath = originalPathExt ? originalPath.slice(0, -originalPathExt.length) + '.mp4' : originalPath + '.mp4';

      return new Promise<void>((resolve, reject) => {
        ffmpeg(originalPath)
          .inputOptions(FFMPEG_OPTIONS.inputOptions)
          .output(newPath)
          .videoCodec(FFMPEG_OPTIONS.videoCodec)
          .audioCodec(FFMPEG_OPTIONS.audioCodec)
          .videoFilter(FFMPEG_OPTIONS.videoFilter)
          .outputOptions(FFMPEG_OPTIONS.outputOptions)
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
            const origExt = extname(file.originalname);
            file.originalname = origExt ? file.originalname.slice(0, -origExt.length) + '.mp4' : file.originalname + '.mp4';
            file.filename = newFilename;
            file.path = newPath;
            file.mimetype = 'video/mp4';

            try {
              const stats = fs.statSync(newPath);
              file.size = stats.size;
            } catch (e) {
              console.error('Error getting stats for new file:', e);
            }

            resolve();
          })
          .on('error', (err, stdout, stderr) => {
            console.error('FFmpeg conversion error:', err);
            console.error('FFmpeg stderr:', stderr);
            // reject để báo lỗi, không lưu file sai định dạng
            reject(new BadRequestException('Lỗi chuyển đổi video. Vui lòng thử lại.'));
          })
          .run();
      });
    }
  }
}
