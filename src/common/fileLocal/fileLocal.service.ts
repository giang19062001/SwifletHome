import { Injectable } from '@nestjs/common';
import { LoggingService } from '../logger/logger.service';
import { existsSync, promises as fs, mkdirSync } from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import * as QRCode from 'qrcode';
import { getFileLocation } from 'src/config/multer.config';

@Injectable()
export class FileLocalService {
  private readonly PUBLIC_PATH = 'public';
  private readonly SERVICE_NAME = 'FileLocalService';
  constructor(private readonly logger: LoggingService) {
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists(): void {
    if (!existsSync(this.PUBLIC_PATH)) {
      mkdirSync(this.PUBLIC_PATH, { recursive: true });
    }
  }

  async generateQrcode(requestCode: string) {
    const targetUrl = `${process.env.CURRENT_URL}/qrcode-global/${requestCode}`;

    const mimetype = 'image/png';
    const fieldname = 'qrcode';

    const location = getFileLocation(mimetype, fieldname);
    const dirPath = path.join(process.cwd(), this.PUBLIC_PATH, location);

    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }

    const fileName = `qr-${requestCode}.png`;
    const fullPath = path.join(dirPath, fileName);

    await QRCode.toFile(fullPath, targetUrl, {
      width: 300,
      margin: 1,
    });

    return {
      qrTargetUrl: targetUrl,
      qrCodeUrl: `${location}/${fileName}`, // lưu DB
    };
  }

  public async replaceFile(file: Express.Multer.File, baseName: string, location: string) {
    const filePath = path.join(process.cwd(), this.PUBLIC_PATH, location);

    const logbase = `${this.SERVICE_NAME}/replaceFile`;

    // Xóa tất cả file <name>.* nếu có
    const files = await fs.readdir(filePath);
    for (const f of files) {
      if (f.startsWith(baseName)) {
        await fs.unlink(path.join(filePath, f));
      }
    }

    // Lấy extension từ mimetype hoặc originalname của file mới
    const ext = file.originalname.split('.').pop();
    const newFileName = `${baseName}.${ext}`;
    const newFilePath = path.join(filePath, newFileName);

    // Ghi file mới
    await fs.writeFile(newFilePath, file.buffer);
    this.logger.log(logbase, `Thay đổi tệp thành công ${newFileName} khỏi thư mục`);
    return newFileName;
  }
  public async deleteLocalFile(filepath: string): Promise<void> {
    const logbase = `${this.SERVICE_NAME}/deleteLocalFile`;
    try {
      const filePath = path.join(process.cwd(), this.PUBLIC_PATH, filepath);

      try {
        await fs.access(filePath);
      } catch {
        this.logger.error(logbase, `Không tìm thấy tệp ${filepath} trong thư mục`);
        return;
      }

      await fs.unlink(filePath);
      this.logger.log(logbase, `Đã xóa thành công tệp ${filepath} khỏi thư mục`);
    } catch (error) {
      this.logger.error(logbase, `Không xóa được tệp ${filepath} khỏi thư mục -> ${JSON.stringify(error)}`);
    }
  }
  async getImageDimensions(filepath: string): Promise<{ width: number; height: number } | null> {
    const thePath = path.join(process.cwd(), this.PUBLIC_PATH, filepath);
    if (!existsSync(thePath)) {
      return null;
    }

    try {
      const metadata = await sharp(thePath).metadata();
      return {
        width: metadata.width!,
        height: metadata.height!,
      };
    } catch (error) {
      console.log('error', error);
      return null;
    }
  }
}
