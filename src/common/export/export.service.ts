import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PdfBaseService } from './services/pdf-base.service';
import { TraceabilityPdfTemplate } from './templates/pdf/traceability.pdf';

@Injectable()
export class ExportService {
  constructor(
    private readonly pdfBaseService: PdfBaseService,
    private readonly traceabilityPdfTemplate: TraceabilityPdfTemplate,
  ) {}

  async generatePdfFromTraceData(traceData: any, qrUrl?: string): Promise<Buffer> {
    return this.traceabilityPdfTemplate.generate(traceData, qrUrl);
  }

  async generatePdfFromUrl(url: string): Promise<Buffer> {
    try {
      const match = url.match(/\/traceability-qrcode-global\/([^/?#]+)/);
      const cleanId = match && match[1] ? match[1] : '';

      const response = await axios.get(url).catch(() => null);
      if (response && response.data) {
        return this.generatePdfFromTraceData(
          {
            traceabilityId: cleanId || '-',
            homeInfo: {
              userHomeName: 'Hệ thống Nhà yến 3FAM',
              userName: 'Cơ sở sản xuất yến sào',
              userHomeAddress: 'Chi tiết xem tại hệ thống 3FAM',
            },
            forms: [],
          },
          url,
        );
      }

      return this.generatePdfFromTraceData({ traceabilityId: cleanId || 'TRACEABILITY' }, url);
    } catch (e) {
      return this.generateGenericPdfFromText('Báo cáo PDF', `URL: ${url}`);
    }
  }

  private async generateGenericPdfFromText(title: string, content: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = this.pdfBaseService.createDocument();
        const buffers: Buffer[] = [];
        doc.on('data', (c) => buffers.push(c));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err instanceof Error ? err : new Error(String(err))));

        const fonts = this.pdfBaseService.getFontNames();
        const fontRegular = fonts.regular;
        const fontBold = fonts.bold;

        doc.font(fontBold).fontSize(16).text(title, 40, 40);
        doc.moveDown();
        doc.font(fontRegular).fontSize(10).text(content, 40, doc.y);
        doc.end();
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }
}
