import { Global, Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { PdfBaseService } from './services/pdf-base.service';
import { TraceabilityPdfTemplate } from './templates/pdf/traceability.pdf';
import { FileLocalModule } from '../fileLocal/fileLocal.module';

@Global()
@Module({
  providers: [ExportService, PdfBaseService, TraceabilityPdfTemplate],
  imports: [FileLocalModule],
  exports: [ExportService],
})
export class ExportModule {}
