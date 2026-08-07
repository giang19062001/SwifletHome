import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';
import axios from 'axios';

@Injectable()
export class ExportService {
  private getFontPaths(): { regular: string | null; bold: string | null } {
    const candidateRegulars = [
      'C:\\Windows\\Fonts\\arial.ttf',
      'C:\\Windows\\Fonts\\segoeui.ttf',
      'C:\\Windows\\Fonts\\times.ttf',
      '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
      '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    ];
    const candidateBolds = [
      'C:\\Windows\\Fonts\\arialbd.ttf',
      'C:\\Windows\\Fonts\\segoeuib.ttf',
      'C:\\Windows\\Fonts\\timesbd.ttf',
      '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
      '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
    ];

    const regular = candidateRegulars.find((p) => fs.existsSync(p)) || null;
    const bold = candidateBolds.find((p) => fs.existsSync(p)) || null;

    return { regular, bold };
  }

  async generatePdfFromTraceData(traceData: any, qrUrl?: string): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        const fonts = this.getFontPaths();
        if (fonts.regular) {
          doc.registerFont('CustomRegular', fonts.regular);
          doc.font('CustomRegular');
        }
        if (fonts.bold) {
          doc.registerFont('CustomBold', fonts.bold);
        }

        const fontRegular = fonts.regular ? 'CustomRegular' : 'Helvetica';
        const fontBold = fonts.bold ? 'CustomBold' : 'Helvetica-Bold';

        // HEADER BANNER
        doc.fillColor('#1B365D').rect(0, 0, 595.28, 60).fill();
        doc.font(fontBold).fontSize(16).fillColor('#FFFFFF').text('HỆ THỐNG TRUY XUẤT NGUỒN GỐC 3FAM', 40, 18);
        doc.font(fontRegular).fontSize(10).fillColor('#CBD5E1').text('Hồ sơ điện tử truy xuất nguồn gốc sản phẩm yến sào', 40, 38);

        let currentY = 80;

        // QR CODE & TITLE
        const traceId = traceData?.traceabilityId || 'N/A';
        const qrContent = qrUrl || `https://3fam.vn/traceability/${traceId}`;

        // generate QR asynchronously, but don't await inside the Promise executor
        QRCode.toBuffer(qrContent, { width: 90, margin: 1 })
          .then((qrBuffer) => {
            try {
              doc.image(qrBuffer, 465, currentY, { width: 90 });
            } catch {
              // ignore image placement errors
            }
          })
          .catch(() => {
            // ignore qr fail
          });

        doc.font(fontBold).fontSize(14).fillColor('#1E293B').text('HỒ SƠ TRUY XUẤT NGUỒN GỐC', 40, currentY);
        doc
          .font(fontRegular)
          .fontSize(10)
          .fillColor('#64748B')
          .text(`Mã tra cứu: ${traceId}`, 40, currentY + 22);
        doc
          .font(fontRegular)
          .fontSize(9)
          .fillColor('#64748B')
          .text(`Ngày xuất file: ${new Date().toLocaleString('vi-VN')}`, 40, currentY + 38);

        currentY += 105;

        // SECTION 1: FACILITY / HOUSE INFO
        doc.fillColor('#F1F5F9').roundedRect(40, currentY, 515, 95, 6).fill();

        doc
          .font(fontBold)
          .fontSize(11)
          .fillColor('#0F172A')
          .text('THÔNG TIN CƠ SỞ CHÍNH', 52, currentY + 10);

        const homeInfo = traceData?.homeInfo || {};
        const houseName = homeInfo.userHomeName || 'N/A';
        const ownerName = homeInfo.userName || 'N/A';
        const address = homeInfo.userHomeAddress || 'N/A';

        doc.font(fontBold).fontSize(9.5).fillColor('#334155');
        doc.text('Tên nhà yến: ', 52, currentY + 30, { continued: true });
        doc.font(fontRegular).text(houseName);

        doc.font(fontBold).text('Chủ sở hữu: ', 52, currentY + 48, { continued: true });
        doc.font(fontRegular).text(ownerName);

        doc.font(fontBold).text('Địa chỉ sản xuất: ', 52, currentY + 66, { continued: true });
        doc.font(fontRegular).text(address);

        currentY += 115;

        // SECTION 2: FORMS & SUBMISSIONS
        doc.font(fontBold).fontSize(12).fillColor('#0D6EFD').text('NHẬT KÝ BIỂU MẪU TRUY XUẤT NGUỒN GỐC', 40, currentY);

        currentY += 22;

        const forms = traceData?.forms || [];
        if (forms.length === 0) {
          doc.font(fontRegular).fontSize(10).fillColor('#64748B').text('Chưa có thông tin biểu mẫu.', 40, currentY);
        } else {
          forms.forEach((form: any, idx: number) => {
            if (currentY > 720) {
              doc.addPage();
              currentY = 40;
            }

            const formTitle = `${idx + 1}. ${form.formName || 'Biểu mẫu'}`;
            const statusLabel = form.hasData ? form.submission?.statusLabel || form.submission?.status || 'Đã ghi nhận' : 'Chưa có dữ liệu';

            doc.fillColor('#F8FAFC').strokeColor('#E2E8F0').lineWidth(1).roundedRect(40, currentY, 515, 30, 4).fillAndStroke();

            doc
              .font(fontBold)
              .fontSize(10)
              .fillColor('#1E293B')
              .text(formTitle, 50, currentY + 8);

            doc
              .font(fontBold)
              .fontSize(9)
              .fillColor(form.hasData ? '#16A34A' : '#94A3B8')
              .text(`[ ${statusLabel} ]`, 430, currentY + 8, { width: 110, align: 'right' });

            currentY += 36;

            if (form.hasData && form.submission?.groups) {
              form.submission.groups.forEach((group: any) => {
                if (currentY > 740) {
                  doc.addPage();
                  currentY = 40;
                }

                doc.font(fontBold).fontSize(9.5).fillColor('#2563EB').text(`• ${group.groupName}`, 50, currentY);
                currentY += 15;

                if (group.fields) {
                  group.fields.forEach((field: any) => {
                    if (currentY > 750) {
                      doc.addPage();
                      currentY = 40;
                    }

                    let valStr = 'Chưa nhập thông tin';
                    if (field.currentValue !== null && field.currentValue !== undefined && field.currentValue !== '') {
                      if (field.fieldType === 'file_single') {
                        valStr = field.currentValue?.url ? `[Tệp đính kèm: ${field.currentValue.url}]` : 'Chưa có tệp đính kèm';
                      } else if (field.fieldType === 'file_multiple') {
                        valStr = Array.isArray(field.currentValue) && field.currentValue.length > 0 ? `[${field.currentValue.length} tệp đính kèm]` : 'Chưa có tệp đính kèm';
                      } else if (Array.isArray(field.currentValue)) {
                        valStr = field.currentValue.join(', ');
                      } else {
                        valStr = String(field.currentValue);
                      }
                    }

                    doc.font(fontBold).fontSize(9).fillColor('#475569').text(`${field.fieldName}: `, 60, currentY, { continued: true });
                    doc.font(fontRegular).fillColor('#0F172A').text(valStr);

                    currentY += 14;
                  });
                }
                currentY += 5;
              });
            } else {
              doc.font(fontRegular).fontSize(9).fillColor('#94A3B8').text('  Chưa có dữ liệu ghi nhận cho biểu mẫu này.', 50, currentY);
              currentY += 16;
            }

            currentY += 10;
          });
        }

        // FOOTER / PAGE NUMBERS
        const pageRange = doc.bufferedPageRange();
        for (let i = pageRange.start; i < pageRange.start + pageRange.count; i++) {
          doc.switchToPage(i);
          doc
            .font(fontRegular)
            .fontSize(8)
            .fillColor('#94A3B8')
            .text(`Trang ${i + 1} / ${pageRange.count} - 3FAM Swiftlet Home Traceability Report`, 40, 800, { align: 'center', width: 515 });
        }

        doc.end();
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }

  async generatePdfFromUrl(url: string): Promise<Buffer> {
    try {
      const match = url.match(/\/traceability-qrcode-global\/([^/?#]+)/);
      const cleanId = match && match[1] ? match[1] : '';

      // Try fetching HTML / data from URL if available
      const response = await axios.get(url).catch(() => null);
      if (response && response.data) {
        // Render generated PDF from trace data
        return this.generatePdfFromTraceData(
          {
            traceabilityId: cleanId || 'TRACEABILITY',
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
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers: Buffer[] = [];
        doc.on('data', (c) => buffers.push(c));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err instanceof Error ? err : new Error(String(err))));

        const fonts = this.getFontPaths();
        if (fonts.regular) doc.registerFont('CustomRegular', fonts.regular);
        if (fonts.bold) doc.registerFont('CustomBold', fonts.bold);

        const fontRegular = fonts.regular ? 'CustomRegular' : 'Helvetica';
        const fontBold = fonts.bold ? 'CustomBold' : 'Helvetica-Bold';

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
