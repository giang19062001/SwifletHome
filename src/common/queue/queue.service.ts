import { Processor, WorkerHost } from '@nestjs/bullmq';
import { OnModuleDestroy } from '@nestjs/common';
import { Job } from 'bullmq';
import * as puppeteer from 'puppeteer';
import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import { FFMPEG_OPTIONS } from 'src/config/ffmpeg.config';
import { FirebaseService } from '../firebase/firebase.service';
import { LoggingService } from '../logger/logger.service';

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

// PROCESSOR CHO NOTIFICATION
@Processor('notification', {
  concurrency: 5, // chạy 5 job cùng lúc
})
export class NotificationQueueService extends WorkerHost {
  private readonly loggerName = 'NotificationQueue';

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly logger: LoggingService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const logbase = `${this.loggerName}/process`;
    const { userCode, deviceToken, title, body, data, notificationType } = job.data;

    this.logger.log(logbase, `Đang xử lý thông báo trong hàng đợi cho user(${userCode}), token: ${deviceToken ? deviceToken.substring(0, 20) : 'empty'}...`);
    try {
      const result = await this.firebaseService.sendNotification(userCode, deviceToken, title, body, data, notificationType);
      this.logger.log(logbase, `Đã gửi thông báo trong hàng đợi thành công cho user(${userCode}), messageId code: ${result}`);
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(logbase, `Không thể gửi thông báo đã xếp hàng chờ cho user(${userCode}): ${message}`);
      throw error;
    }
  }
}

// PROCESSOR CHO VIDEO CONVERTER
@Processor('video', {
  concurrency: 1, // Xử lý 1 video tại 1 thời điểm để tránh quá tải CPU
})
export class VideoQueueService extends WorkerHost {
  private readonly loggerName = 'VideoQueue';

  constructor(private readonly logger: LoggingService) {
    super();
  }

  async process(job: Job<{ originalPath: string; tempPath: string; newPath: string }>): Promise<any> {
    const logbase = `${this.loggerName}/process`;
    const { originalPath, tempPath, newPath } = job.data;

    this.logger.log(logbase, `Bắt đầu nén video trong hàng đợi: ${originalPath}`);

    return new Promise((resolve, reject) => {
      ffmpeg(originalPath)
        .inputOptions(FFMPEG_OPTIONS.inputOptions)
        .output(tempPath)
        .videoCodec(FFMPEG_OPTIONS.videoCodec)
        .audioCodec(FFMPEG_OPTIONS.audioCodec)
        .videoFilter(FFMPEG_OPTIONS.videoFilter)
        .outputOptions(FFMPEG_OPTIONS.outputOptions)
        .on('end', () => {
          try {
            // Xóa file gốc (nếu nó không phải là file đích mp4)
            if (originalPath !== newPath && fs.existsSync(originalPath)) {
              fs.unlinkSync(originalPath);
            }
            // Đổi tên file tạm thành file đích chính thức
            if (fs.existsSync(tempPath)) {
              fs.renameSync(tempPath, newPath);
            }
            this.logger.log(logbase, `Hoàn tất nén video: ${newPath}`);
            resolve('Convert video success');
          } catch (e: unknown) {
            const error = e instanceof Error ? e : new Error(String(e));

            this.logger.error(logbase, `Lỗi khi đổi tên file video temp: ${error.message}`);

            reject(error);
          }
        })
        .on('error', (err, stdout, stderr) => {
          this.logger.error(logbase, `Lỗi khi convert video bằng FFmpeg: ${err.message}`);
          console.error('Chi tiết lỗi:', stderr);
          // Thử xóa file temp nếu convert lỗi
          if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
          }
          reject(err);
        })
        .run();
    });
  }
}

// PROCESSOR CHO PDF GENERATOR (PUPPETEER - MAX 2 TABS CONCURRENCY)
@Processor('pdf', {
  concurrency: 2, // Tối đa 2 tab Chrome / job xử lý đồng thời để tránh quá tải CPU/RAM
})
export class PdfQueueService extends WorkerHost implements OnModuleDestroy {
  private readonly loggerName = 'PdfQueue';
  private browser: puppeteer.Browser | null = null;

  constructor(private readonly logger: LoggingService) {
    super();
  }

  private async getBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser || !this.browser.isConnected()) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      });
    }
    return this.browser;
  }

  async process(job: Job<{ targetUrl: string }>): Promise<string> {
    const logbase = `${this.loggerName}/process`;
    const { targetUrl } = job.data;

    this.logger.log(logbase, `Đang xử lý tạo file PDF trong hàng đợi BullMQ: ${targetUrl}`);

    let page: puppeteer.Page | null = null;
    try {
      const browser = await this.getBrowser();
      page = await browser.newPage();

      await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });
      await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      // Ẩn nút bấm tải PDF trôi nổi nếu có trên giao diện
      await page.evaluate(() => {
        const btn = document.querySelector('.pdf-floating-btn');
        if (btn) {
          (btn as HTMLElement).style.display = 'none';
        }
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      });

      this.logger.log(logbase, `Tạo file PDF thành công trong hàng đợi cho: ${targetUrl}`);
      return Buffer.from(pdfBuffer).toString('base64');
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      this.logger.error(logbase, `Lỗi khi tạo PDF trong hàng đợi: ${error.message}`);
      throw error;
    } finally {
      if (page) {
        await page.close().catch(() => {});
      }
    }
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close().catch(() => {});
    }
  }
}
