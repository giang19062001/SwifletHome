import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Readable } from 'stream';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private static instance: MinioService | null = null;
  private client: Minio.Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  public static getInstance(): MinioService | null {
    return MinioService.instance;
  }

  constructor(private readonly configService: ConfigService) {
    MinioService.instance = this;
    const endPoint = this.configService.get<string>('MINIO_ENDPOINT')!;
    const port = Number(this.configService.get<number>('MINIO_PORT')!);
    const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY')!;
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY')!;

    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME')!;
    this.publicUrl = this.configService.get<string>('MINIO_PUBLIC_URL')!;

    this.client = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }

  async onModuleInit() {
    await this.ensureBucketAndPolicy();
  }

  /**
   * Đảm bảo Bucket tồn tại và cấu hình Anonymous Download (Public Read)
   */
  private async ensureBucketAndPolicy(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.bucketName);
      if (!exists) {
        await this.client.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Đã tạo mới MinIO Bucket: [${this.bucketName}]`);
      } else {
        this.logger.log(`MinIO Bucket [${this.bucketName}] đã sẵn sàng`);
      }

      // Thiết lập policy Public Read cho bucket để Client truy cập trực tiếp
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicRead',
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };

      await this.client.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      this.logger.log(`Đã áp dụng quyền Public Read cho Bucket [${this.bucketName}]`);
    } catch (error: any) {
      this.logger.warn(`Không thể kết nối hoặc khởi tạo MinIO Bucket [${this.bucketName}]: ${error.message}`);
    }
  }

  /**
   * Chuẩn hóa Object Key bên trong bucket:
   * Loại bỏ dấu '/' ở đầu và tiền tố 'uploads/' nếu có để tránh lặp bucket name
   */
  public normalizeKey(pathOrKey: string): string {
    if (!pathOrKey) return '';
    let clean = pathOrKey.replace(/\\/g, '/').replace(/^\/+/, '');
    if (clean.startsWith(`${this.bucketName}/`)) {
      clean = clean.slice(this.bucketName.length + 1);
    }
    return clean;
  }

  /**
   * Tạo đường dẫn lưu trong DB (luôn bắt đầu bằng uploads/...)
   */
  public toDbPath(objectKey: string): string {
    const normalized = this.normalizeKey(objectKey);
    return `${this.bucketName}/${normalized}`;
  }

  /**
   * Lấy URL công khai của file
   */
  public getPublicUrl(pathOrKey: string): string {
    const normalized = this.normalizeKey(pathOrKey);
    return `${this.publicUrl}/${normalized}`;
  }

  /**
   * Upload Buffer lên MinIO
   */
  async uploadBuffer(buffer: Buffer, objectKey: string, mimetype: string = 'application/octet-stream'): Promise<string> {
    const normalizedKey = this.normalizeKey(objectKey);
    await this.client.putObject(this.bucketName, normalizedKey, buffer, buffer.length, {
      'Content-Type': mimetype,
    });
    return this.toDbPath(normalizedKey);
  }

  /**
   * Upload file từ đường dẫn cục bộ (Disk)
   */
  async uploadFromPath(localPath: string, objectKey: string, mimetype?: string): Promise<string> {
    const normalizedKey = this.normalizeKey(objectKey);
    const metaData: Record<string, string> = mimetype ? { 'Content-Type': mimetype } : {};
    await this.client.fPutObject(this.bucketName, normalizedKey, localPath, metaData);
    return this.toDbPath(normalizedKey);
  }

  /**
   * Upload từ Express.Multer.File (hỗ trợ cả buffer và disk temp path)
   */
  async uploadFile(file: Express.Multer.File, location: string, customFileName?: string): Promise<string> {
    const fileName = customFileName || file.filename || file.originalname;
    const objectKey = `${location}/${fileName}`;

    if (file.buffer) {
      return await this.uploadBuffer(file.buffer, objectKey, file.mimetype);
    } else if (file.path) {
      return await this.uploadFromPath(file.path, objectKey, file.mimetype);
    }

    throw new Error('File không hợp lệ: Không tìm thấy buffer hoặc path');
  }

  /**
   * Xóa một file trên MinIO
   */
  async deleteObject(pathOrKey: string): Promise<void> {
    const normalizedKey = this.normalizeKey(pathOrKey);
    if (!normalizedKey) return;
    try {
      await this.client.removeObject(this.bucketName, normalizedKey);
      this.logger.log(`Đã xóa object khỏi MinIO: ${normalizedKey}`);
    } catch (error: any) {
      this.logger.error(`Lỗi khi xóa object [${normalizedKey}] khỏi MinIO: ${error.message}`);
    }
  }

  /**
   * Xóa hàng loạt file trên MinIO
   */
  async deleteObjects(pathsOrKeys: string[]): Promise<void> {
    const normalizedKeys = pathsOrKeys.map((k) => this.normalizeKey(k)).filter(Boolean);
    if (!normalizedKeys.length) return;

    try {
      await this.client.removeObjects(this.bucketName, normalizedKeys);
      this.logger.log(`Đã xóa ${normalizedKeys.length} objects khỏi MinIO`);
    } catch (error: any) {
      this.logger.error(`Lỗi khi xóa danh sách objects khỏi MinIO: ${error.message}`);
    }
  }

  /**
   * Đọc object từ MinIO trả về Buffer
   */
  async getObjectBuffer(pathOrKey: string): Promise<Buffer> {
    const normalizedKey = this.normalizeKey(pathOrKey);
    const stream = await this.client.getObject(this.bucketName, normalizedKey);

    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err) => reject(err));
    });
  }

  /**
   * Đọc object từ MinIO trả về Stream
   */
  async getObjectStream(pathOrKey: string): Promise<Readable> {
    const normalizedKey = this.normalizeKey(pathOrKey);
    return await this.client.getObject(this.bucketName, normalizedKey);
  }

  /**
   * Lấy thông tin metadata của object (size, contentType, lastModified,...)
   */
  async statObject(pathOrKey: string): Promise<Minio.BucketItemStat | null> {
    const normalizedKey = this.normalizeKey(pathOrKey);
    try {
      return await this.client.statObject(this.bucketName, normalizedKey);
    } catch {
      return null;
    }
  }

  /**
   * Kiểm tra object có tồn tại trên MinIO không
   */
  async exists(pathOrKey: string): Promise<boolean> {
    const normalizedKey = this.normalizeKey(pathOrKey);
    try {
      await this.client.statObject(this.bucketName, normalizedKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Liệt kê tất cả objects (phục vụ cron quét dọn file rác)
   */
  async listAllObjects(prefix?: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const cleanPrefix = prefix ? this.normalizeKey(prefix) : '';
      const stream = this.client.listObjectsV2(this.bucketName, cleanPrefix, true);
      const objects: string[] = [];

      stream.on('data', (item) => {
        if (item.name) {
          objects.push(this.toDbPath(item.name));
        }
      });
      stream.on('end', () => resolve(objects));
      stream.on('error', (err) => reject(err));
    });
  }

  /**
   * Lấy instance gốc của Minio.Client nếu cần thực hiện lệnh nâng cao
   */
  public getClient(): Minio.Client {
    return this.client;
  }
}
