import { Injectable } from '@nestjs/common';
import { PdfBaseService } from './services/pdf-base.service';
import { TraceabilityPdfTemplate } from './templates/pdf/traceability.pdf';

@Injectable()
export class ExportService {
  constructor(
    private readonly pdfBaseService: PdfBaseService,
    private readonly traceabilityPdfTemplate: TraceabilityPdfTemplate,
  ) {}

  async generatePdfFromTraceData(traceData: any, qrUrl?: string, mode: 'compact' | 'full' = 'compact'): Promise<Buffer> {
    if (mode === 'full') {
      return this.generateFullPdfFromTraceData(traceData, qrUrl);
    }
    return this.generateCompactPdfFromTraceData(traceData, qrUrl);
  }

  async generateCompactPdfFromTraceData(traceData: any, qrUrl?: string): Promise<Buffer> {
    return this.traceabilityPdfTemplate.generateCompact(traceData, qrUrl);
  }

  async generateFullPdfFromTraceData(traceData: any, qrUrl?: string): Promise<Buffer> {
    return this.traceabilityPdfTemplate.generateFull(traceData, qrUrl);
  }

  async generatePdfFromUrl(url: string, mode?: 'compact' | 'full'): Promise<Buffer> {
    try {
      const match = url.match(/\/(?:traceability-qrcode-global|traceability-link-global)\/([^/?#]+)/);
      const cleanId = match && match[1] ? match[1] : '';
      if (!cleanId) {
        throw new Error('Dữ liệu tạo PDF không hợp lệ');
      }

      const inferredMode = mode || (url.includes('traceability-link-global') ? 'full' : 'compact');
      return this.generatePdfFromTraceData({ traceabilityId: cleanId }, url, inferredMode);
    } catch (e) {
      if (e instanceof Error) {
        throw e;
      }
      throw new Error(String(e));
    }
  }
}
