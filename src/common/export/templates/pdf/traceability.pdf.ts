import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';
import { PdfBaseService } from '../../services/pdf-base.service';

@Injectable()
export class TraceabilityPdfTemplate {
  constructor(private readonly pdfBaseService: PdfBaseService) {}

  async generate(traceData: any, qrUrl?: string): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = this.pdfBaseService.createDocument();
        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        const fonts = this.pdfBaseService.getFontNames();
        const fontRegular = fonts.regular;
        const fontBold = fonts.bold;

        // HEADER BANNER (Formal Legal Style)
        doc.font(fontBold).fontSize(14).fillColor('#71AB33').text('HỆ THỐNG TRUY XUẤT NGUỒN GỐC 3FAM', 40, 40);
        doc.font(fontRegular).fontSize(10).fillColor('#555555').text('Hồ sơ điện tử truy xuất nguồn gốc sản phẩm yến sào', 40, 58);

        // Line under header
        doc.moveTo(40, 75).lineTo(555, 75).strokeColor('#71AB33').lineWidth(1.5).stroke();

        let currentY = 95;

        // QR CODE & TITLE
        const traceId = traceData?.traceabilityId || 'N/A';
        const qrContent = qrUrl || '';

        // generate QR asynchronously, but don't await inside the Promise executor
        QRCode.toBuffer(qrContent, { width: 80, margin: 1 })
          .then((qrBuffer) => {
            try {
              doc.image(qrBuffer, 475, 85, { width: 80 });
            } catch {
              // ignore image placement errors
            }
          })
          .catch(() => {
            // ignore qr fail
          });

        doc.font(fontBold).fontSize(16).fillColor('#000000').text('HỒ SƠ TRUY XUẤT NGUỒN GỐC', 40, currentY, { align: 'center' });
        doc
          .font(fontRegular)
          .fontSize(11)
          .fillColor('#333333')
          .text(`Mã tra cứu: ${traceId}`, 40, currentY + 25, { align: 'center' });
        doc
          .font(fontRegular)
          .fontSize(10)
          .fillColor('#555555')
          .text(`Ngày xuất file: ${new Date().toLocaleString('vi-VN')}`, 40, currentY + 40, { align: 'center' });

        currentY += 85;

        // SECTION 1: FACILITY / HOUSE INFO
        doc.font(fontBold).fontSize(12).fillColor('#71AB33').text('I. THÔNG TIN CƠ SỞ CHÍNH', 40, currentY);

        currentY += 20;

        doc.strokeColor('#71AB33').lineWidth(1).rect(40, currentY, 515, 80).stroke();

        const homeInfo = traceData?.homeInfo || {};
        const houseName = homeInfo.userHomeName || 'N/A';
        const ownerName = homeInfo.userName || 'N/A';
        const address = homeInfo.userHomeAddress || 'N/A';

        doc.font(fontBold).fontSize(10).fillColor('#000000');
        doc.text('Tên nhà yến: ', 55, currentY + 15, { continued: true });
        doc.font(fontRegular).text(houseName);

        doc.font(fontBold).text('Chủ sở hữu: ', 55, currentY + 35, { continued: true });
        doc.font(fontRegular).text(ownerName);

        doc.font(fontBold).text('Địa chỉ sản xuất: ', 55, currentY + 55, { continued: true });
        doc.font(fontRegular).text(address);

        currentY += 105;

        // SECTION 2: FORMS & SUBMISSIONS
        doc.font(fontBold).fontSize(12).fillColor('#71AB33').text('II. NHẬT KÝ BIỂU MẪU TRUY XUẤT NGUỒN GỐC', 40, currentY);

        currentY += 25;

        const forms = traceData?.forms || [];
        if (forms.length === 0) {
          doc.font(fontRegular).fontSize(10).fillColor('#555555').text('Chưa có thông tin biểu mẫu.', 40, currentY);
        } else {
          forms.forEach((form: any, idx: number) => {
            if (currentY > 720) {
              doc.addPage();
              currentY = 40;
            }

            const formTitle = `${idx + 1}. ${form.formName || ''}`;

            // Formal rectangular block for form title
            doc.fillColor('#F4F9EE').strokeColor('#71AB33').lineWidth(1).rect(40, currentY, 515, 26).fillAndStroke();

            doc
              .font(fontBold)
              .fontSize(10)
              .fillColor('#000000')
              .text(formTitle, 50, currentY + 8);

            currentY += 36;

            if (form.hasData && form.submission?.groups) {
              form.submission.groups.forEach((group: any) => {
                if (currentY > 740) {
                  doc.addPage();
                  currentY = 40;
                }

                doc.font(fontBold).fontSize(10).fillColor('#000000').text(`• ${group.groupName}`, 50, currentY);
                currentY += 16;

                if (group.fields) {
                  group.fields.forEach((field: any) => {
                    if (currentY > 750) {
                      doc.addPage();
                      currentY = 40;
                    }

                    let isImageSingle = false;
                    let imageUrl = '';
                    let multipleImages: string[] = [];
                    let valStr = 'Chưa nhập thông tin';

                    if (field.currentValue !== null && field.currentValue !== undefined && field.currentValue !== '') {
                      const baseUrl = (process.env.CURRENT_URL ?? '').replace(/\/$/, '');
                      if (field.fieldType === 'file_single') {
                        const url = field.currentValue?.url || '';
                        const isImg = url.toLowerCase().match(/\.(jpg|jpeg|png)$/);
                        if (isImg) {
                          isImageSingle = true;
                          imageUrl = url;
                          valStr = '';
                        } else {
                          valStr = url ? `${baseUrl}/${url}` : 'Chưa có tệp đính kèm';
                        }
                      } else if (field.fieldType === 'file_multiple') {
                        const files = field.currentValue || [];
                        if (Array.isArray(files) && files.length > 0) {
                          multipleImages = files.map((f: any) => f.url).filter((u: string) => u.toLowerCase().match(/\.(jpg|jpeg|png)$/));
                          const nonImages = files.map((f: any) => f.url).filter((u: string) => !u.toLowerCase().match(/\.(jpg|jpeg|png)$/));

                          if (multipleImages.length > 0 && nonImages.length === 0) {
                            valStr = '';
                          } else {
                            const nonImageLinks = nonImages.map((u: string) => `${baseUrl}/${u}`).join('\n');
                            valStr = multipleImages.length > 0 ? `(Có ${multipleImages.length} ảnh đính kèm bên dưới)\n${nonImageLinks}` : nonImageLinks;
                          }
                        } else {
                          valStr = 'Chưa có tệp đính kèm';
                        }
                      } else if (Array.isArray(field.currentValue)) {
                        valStr = field.currentValue.join(', ');
                      } else {
                        valStr = String(field.currentValue);
                      }
                    }

                    doc
                      .font(fontBold)
                      .fontSize(9.5)
                      .fillColor('#333333')
                      .text(`${field.fieldName}: `, 60, currentY, { continued: valStr !== '' });

                    if (valStr !== '') {
                      doc.font(fontRegular).fillColor('#000000').text(valStr);
                      currentY += 15;
                    } else {
                      doc.text(''); // end the continued line
                      currentY += 15;

                      const renderImage = (imgUrl: string) => {
                        // Assuming files are served from 'public' folder
                        const imgPath = path.join(process.cwd(), 'public', imgUrl);
                        if (fs.existsSync(imgPath)) {
                          if (currentY > 680) {
                            doc.addPage();
                            currentY = 40;
                          }
                          try {
                            doc.image(imgPath, 60, currentY, { height: 100 });
                            currentY += 110;
                          } catch (e) {
                            doc.font(fontRegular).fillColor('#000000').text(`[Lỗi hiển thị ảnh: ${imgUrl}]`, 60, currentY);
                            currentY += 15;
                          }
                        } else {
                          doc.font(fontRegular).fillColor('#000000').text(`[Tệp đính kèm: ${imgUrl}]`, 60, currentY);
                          currentY += 15;
                        }
                      };

                      if (isImageSingle) renderImage(imageUrl);
                      if (multipleImages.length > 0) {
                        multipleImages.forEach((img) => renderImage(img));
                      }
                    }
                  });
                }
                currentY += 6;
              });
            } else {
              doc.font(fontRegular).fontSize(9.5).fillColor('#555555').text('  Chưa có dữ liệu ghi nhận cho biểu mẫu này.', 50, currentY);
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
}
