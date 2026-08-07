import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

class Semaphore {
  private queue: (() => void)[] = [];
  private current = 0;

  constructor(private readonly maxConcurrency: number) {}

  async acquire(): Promise<void> {
    if (this.current < this.maxConcurrency) {
      this.current++;
      return;
    }
    await new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) next();
    } else {
      this.current = Math.max(0, this.current - 1);
    }
  }
}

@Injectable()
export class PdfService implements OnModuleDestroy {
  private browser: puppeteer.Browser | null = null;
  private readonly semaphore = new Semaphore(2); // Giới hạn tối đa 2 tab Chrome xử lý đồng thời

  private async getBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser || !this.browser.isConnected()) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });
    }
    return this.browser;
  }

  async generatePdfFromUrl(url: string): Promise<Buffer> {
    await this.semaphore.acquire();
    let page: puppeteer.Page | null = null;
    try {
      const browser = await this.getBrowser();
      page = await browser.newPage();

      await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

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

      return Buffer.from(pdfBuffer);
    } finally {
      if (page) {
        await page.close().catch(() => {});
      }
      this.semaphore.release();
    }
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close().catch(() => {});
    }
  }
}
