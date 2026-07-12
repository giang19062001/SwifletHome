import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import * as fs from 'fs';
import { extname } from 'path';
import { Observable } from 'rxjs';
import sharp from 'sharp';
import { SHARP_OPTIONS } from 'src/config/sharp.config';

@Injectable()
export class ImageOptimizerInterceptor implements NestInterceptor {
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
          promises.push(this.optimizeIfNeeded(file));
        }
      } else {
        for (const field in request.files) {
          for (const file of request.files[field]) {
            promises.push(this.optimizeIfNeeded(file));
          }
        }
      }
    }

    if (request.file) {
      promises.push(this.optimizeIfNeeded(request.file));
    }

    await Promise.all(promises);
  }

  private async optimizeIfNeeded(file: any): Promise<void> {
    const isImage = file.mimetype.startsWith('image/');

    if (isImage) {
      const originalPath = file.path;
      const originalFilename = file.filename;

      const originalFilenameExt = extname(originalFilename);
      const baseFilename = originalFilenameExt ? originalFilename.slice(0, -originalFilenameExt.length) : originalFilename;
      const newFilename = baseFilename + '.jpg';

      const originalPathExt = extname(originalPath);
      const basePath = originalPathExt ? originalPath.slice(0, -originalPathExt.length) : originalPath;
      const newPath = basePath + '.jpg';

      try {
        // Đọc file thành Buffer để đóng kết nối file ngay lập tức.
        const imageBuffer = fs.readFileSync(originalPath);

        // Thêm .rotate() TRƯỚC .resize() để tự động xoay ảnh theo đúng chiều chuẩn (EXIF metadata từ điện thoại)
        await sharp(imageBuffer).rotate().resize(SHARP_OPTIONS.resize).jpeg(SHARP_OPTIONS.jpeg).toFile(newPath);

        // Đổi object file sang jpg để Controller nhận
        const origExt = extname(file.originalname);
        const baseOriginal = origExt ? file.originalname.slice(0, -origExt.length) : file.originalname;
        file.originalname = baseOriginal + '.jpg';
        file.filename = newFilename;
        file.path = newPath;
        file.mimetype = 'image/jpeg';
      } catch (err) {
        console.error('Lỗi khi tối ưu hóa ảnh bằng Sharp:', err);
        // Nếu nén lỗi, giữ nguyên file gốc để ứng dụng đi tiếp
      }

      try {
        if (originalPath !== newPath && fs.existsSync(originalPath)) {
          fs.unlinkSync(originalPath);
        }
      } catch (e) {
        console.error('Lỗi không thể xóa ảnh gốc (có thể do Windows đang giữ file):', e);
      }
    }
  }
}
