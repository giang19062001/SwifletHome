import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { candidateBolds, candidateRegulars } from '../export.config';

@Injectable()
export class PdfBaseService {
  getFontPaths(): { regular: string | null; bold: string | null } {
    const regular = candidateRegulars.find((p) => fs.existsSync(p)) || null;
    const bold = candidateBolds.find((p) => fs.existsSync(p)) || null;

    return { regular, bold };
  }

  createDocument(options?: any): PDFKit.PDFDocument {
    const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true, ...options });
    const fonts = this.getFontPaths();
    if (fonts.regular) {
      doc.registerFont('CustomRegular', fonts.regular);
    }
    if (fonts.bold) {
      doc.registerFont('CustomBold', fonts.bold);
    }
    return doc;
  }

  getFontNames() {
    const fonts = this.getFontPaths();
    return {
      regular: fonts.regular ? 'CustomRegular' : 'Helvetica',
      bold: fonts.bold ? 'CustomBold' : 'Helvetica-Bold',
    };
  }
}
