import { Injectable } from '@nestjs/common';
import { existsSync, promises as fs, mkdirSync } from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';
import sharp from 'sharp';
import { getFileLocation } from 'src/config/multer.config';
import { LoggingService } from '../logger/logger.service';
import { MinioService } from '../minio/minio.service';

@Injectable()
export class FileLocalService {
  private readonly PUBLIC_PATH = 'public';
  private readonly SERVICE_NAME = 'FileLocalService';

  constructor(
    private readonly logger: LoggingService,
    private readonly minioService: MinioService,
  ) {
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists(): void {
    if (!existsSync(this.PUBLIC_PATH)) {
      mkdirSync(this.PUBLIC_PATH, { recursive: true });
    }
    const tempDir = path.join(this.PUBLIC_PATH, 'temp');
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
  }

  /**
   * Tạo QR Code từ URL, tự động upload lên MinIO (chỉ lưu 1 nơi duy nhất là MinIO)
   * @param targetUrl URL đích mà QR Code trỏ tới
   * @param folderPath Thư mục tương đối (ví dụ: TRACE_CONST.QR_CODE_PATH)
   * @param fileName Tên file ảnh (ví dụ: `${traceabilityId}.png`)
   */
  async generateAndSaveQrCode(targetUrl: string, folderPath: string, fileName: string): Promise<void> {
    const objectKey = `${folderPath}/${fileName}`;

    // Nếu object đã có sẵn trên MinIO thì bỏ qua để tránh tạo lại
    const alreadyExists = await this.minioService.exists(objectKey);
    if (alreadyExists) {
      return;
    }

    try {
      const qrBuffer = await QRCode.toBuffer(targetUrl, {
        width: 300,
        margin: 1,
        type: 'png',
      });

      // Upload lên MinIO
      await this.minioService.uploadBuffer(qrBuffer, objectKey, 'image/png');
    } catch (err: any) {
      this.logger.error(`${this.SERVICE_NAME}/generateAndSaveQrCode`, `Lỗi tạo mã QR [${fileName}]: ${err.message}`);
    }
  }

  async generateQrcode(requestCode: string) {
    const targetUrl = `${process.env.CURRENT_URL}/qrcode-global/${requestCode}`;
    const mimetype = 'image/png';
    const fieldname = 'qrcode';
    const location = getFileLocation(mimetype, fieldname);
    const fileName = `${requestCode}.png`;

    await this.generateAndSaveQrCode(targetUrl, location, fileName);

    return {
      qrTargetUrl: targetUrl,
      qrCodeUrl: `${location}/${fileName}`,
    };
  }

  public async replaceFile(file: Express.Multer.File, baseName: string, location: string) {
    const logbase = `${this.SERVICE_NAME}/replaceFile`;

    // 1. Xóa file cũ trên MinIO nếu có
    try {
      const minioObjects = await this.minioService.listAllObjects(location);
      for (const obj of minioObjects) {
        const objBaseName = path.basename(obj);
        if (objBaseName.startsWith(baseName)) {
          await this.minioService.deleteObject(obj);
        }
      }
    } catch (err: any) {
      this.logger.error(logbase, `Lỗi dọn file MinIO cũ: ${err.message}`);
    }

    // 2. Chuẩn bị file mới
    const ext = file.originalname.split('.').pop();
    const newFileName = `${baseName}.${ext}`;
    const objectKey = `${location}/${newFileName}`;

    // 3. Upload lên MinIO
    try {
      if (file.buffer) {
        await this.minioService.uploadBuffer(file.buffer, objectKey, file.mimetype);
      } else if (file.path) {
        await this.minioService.uploadFromPath(file.path, objectKey, file.mimetype);
        if (existsSync(file.path)) {
          await fs.unlink(file.path).catch(() => {});
        }
      }
      this.logger.log(logbase, `Upload thành công file mới lên MinIO: ${objectKey}`);
    } catch (err: any) {
      this.logger.error(logbase, `Lỗi upload MinIO: ${err.message}`);
    }

    return newFileName;
  }

  public async deleteLocalFile(filepath: string): Promise<void> {
    const logbase = `${this.SERVICE_NAME}/deleteLocalFile`;
    try {
      // Xóa trực tiếp trên MinIO (lưu trữ duy nhất)
      await this.minioService.deleteObject(filepath);
      this.logger.log(logbase, `Đã xóa tệp trên MinIO: ${filepath}`);
    } catch (error) {
      this.logger.error(logbase, `Không xóa được tệp ${filepath} trên MinIO -> ${JSON.stringify(error)}`);
    }
  }

  async getImageDimensions(filepath: string): Promise<{ width: number; height: number } | null> {
    try {
      // Đọc buffer trực tiếp từ MinIO
      const buffer = await this.minioService.getObjectBuffer(filepath);
      if (buffer) {
        const metadata = await sharp(buffer).metadata();
        return {
          width: metadata.width ?? 0,
          height: metadata.height ?? 0,
        };
      }

      return null;
    } catch (error) {
      console.log('getImageDimensions error:', error);
      return null;
    }
  }

  public async preloadImageBuffers(data: any): Promise<Map<string, Buffer>> {
    const map = new Map<string, Buffer>();
    const minio = MinioService.getInstance();
    if (!minio) return map;

    const urls = new Set<string>();
    const scan = (obj: any) => {
      if (!obj) return;
      if (typeof obj === 'string') {
        const clean = obj.replace(/^\/+/, '');
        if (clean.match(/\.(jpg|jpeg|png|webp)$/i) && (clean.includes('uploads/') || clean.includes('images/'))) {
          urls.add(clean);
        }
      } else if (Array.isArray(obj)) {
        for (const item of obj) scan(item);
      } else if (typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
          scan(obj[key]);
        }
      }
    };

    scan(data);

    await Promise.all(
      Array.from(urls).map(async (url) => {
        try {
          const buf = await minio.getObjectBuffer(url);
          if (buf) {
            map.set(url, buf);
            map.set(`/${url}`, buf);
          }
        } catch {}
      }),
    );

    return map;
  }
}
