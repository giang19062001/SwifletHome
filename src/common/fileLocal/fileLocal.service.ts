import { Injectable } from '@nestjs/common';
import { LoggingService } from '../logger/logger.service';
import { existsSync, promises as fs, mkdirSync } from 'fs';
import * as path from 'path';
@Injectable()
export class FileLocalService {
  private readonly UPLOAD_PATH = 'public/uploads';
  private readonly SERVICE_NAME = 'UploadService';
  constructor(private readonly logger: LoggingService) {
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists(): void {
    if (!existsSync(this.UPLOAD_PATH)) {
      mkdirSync(this.UPLOAD_PATH, { recursive: true });
    }
  }
  public async replaceFile(file: Express.Multer.File, baseName: string, location: string) {
    const filePath = path.join(process.cwd(), this.UPLOAD_PATH, location);

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
      const filePath = path.join(process.cwd(), this.UPLOAD_PATH, filepath);

      try {
        await fs.access(filePath);
      } catch {
        this.logger.error(logbase, `Không tìm thấy tệp ${filepath} trong thư mục`);
        return;
      }

      await fs.unlink(filePath);
      this.logger.log(logbase, `Đã xóa thành công tệp ${filepath} khỏi thư mục`);
    } catch (error) {
      this.logger.error(logbase, `Không xóa được tệp ${filepath} khỏi thư mục -> ${error}`);
    }
  }
}
