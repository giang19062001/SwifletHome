import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
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
    if (!file || file.size === 0) {
      throw new BadRequestException('File tải lên không hợp lệ hoặc bị trống (0 bytes).');
    }

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
      const tempPath = basePath + '_temp.jpg';

      try {
        // Đọc file thành Buffer để đóng kết nối file ngay lập tức.
        const imageBuffer = fs.readFileSync(originalPath);

        // Tối ưu hóa ảnh lưu vào file tạm để tránh xung đột ghi đè trực tiếp lên file gốc
        await sharp(imageBuffer).rotate().resize(SHARP_OPTIONS.resize).jpeg(SHARP_OPTIONS.jpeg).toFile(tempPath);

        // Xóa file gốc để tránh xung đột trên Windows
        try {
          if (fs.existsSync(originalPath)) {
            fs.unlinkSync(originalPath);
          }
        } catch (e) {
          console.error('Lỗi không thể xóa ảnh gốc trong quá trình tối ưu:', e);
        }

        // Đổi tên file tạm thành newPath
        fs.renameSync(tempPath, newPath);

        // Đổi object file sang jpg để Controller nhận
        const origExt = extname(file.originalname);
        const baseOriginal = origExt ? file.originalname.slice(0, -origExt.length) : file.originalname;
        file.originalname = baseOriginal + '.jpg';
        file.filename = newFilename;
        file.path = newPath;
        file.mimetype = 'image/jpeg';

        // Cập nhật lại dung lượng thực tế sau khi tối ưu hóa
        if (fs.existsSync(newPath)) {
          const stat = fs.statSync(newPath);
          file.size = stat.size;
        }
      } catch (err) {
        console.error('Lỗi khi tối ưu hóa ảnh bằng Sharp:', err);
        // Dọn dẹp file tạm nếu có lỗi
        if (fs.existsSync(tempPath)) {
          try {
            fs.unlinkSync(tempPath);
          } catch (e) {}
        }
        // Nếu nén lỗi, giữ nguyên file gốc để ứng dụng đi tiếp
      }
    }
  }
}
