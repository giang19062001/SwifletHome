import { Global, Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { PdfBaseService } from './services/pdf-base.service';
import { TraceabilityPdfTemplate } from './templates/pdf/traceability.pdf';

@Global()
@Module({
  providers: [ExportService, PdfBaseService, TraceabilityPdfTemplate],
  exports: [ExportService],
})
export class ExportModule {}
