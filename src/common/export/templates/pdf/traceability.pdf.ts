import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';
import { PdfBaseService } from '../../services/pdf-base.service';

@Injectable()
export class TraceabilityPdfTemplate {
  constructor(private readonly pdfBaseService: PdfBaseService) {}

  async generate(traceData: any, qrUrl?: string): Promise<Buffer> {
    const qrContent = qrUrl || '';
    let qrBuffer: Buffer | null = null;
    if (qrContent) {
      try {
        qrBuffer = await QRCode.toBuffer(qrContent, { width: 80, margin: 1 });
      } catch (e) {
        qrBuffer = null;
      }
    }

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
        const lotcode = traceData?.lotcode || traceData?.compactData?.lotcode || '';

        if (qrBuffer) {
          try {
            doc.image(qrBuffer, 475, 85, { width: 80 });
          } catch {
            // ignore image placement errors
          }
        }

        doc.font(fontBold).fontSize(16).fillColor('#000000').text('HỒ SƠ TRUY XUẤT NGUỒN GỐC', 40, currentY, { align: 'center' });
        doc
          .font(fontRegular)
          .fontSize(10.5)
          .fillColor('#333333')
          .text(`Mã tra cứu: ${traceId}`, 40, currentY + 20, {
            align: 'center',
          });

        doc
          .font(fontRegular)
          .fontSize(10.5)
          .fillColor('#333333')
          .text(`Mã lô: ${lotcode}`, 40, currentY + 38, {
            align: 'center',
          });

        doc
          .font(fontRegular)
          .fontSize(9.5)
          .fillColor('#555555')
          .text(`Ngày xuất file: ${new Date().toLocaleString('vi-VN')}`, 40, currentY + 56, {
            align: 'center',
          });

        currentY += 80;

        const checkPageBreak = (neededHeight: number = 40) => {
          if (currentY + neededHeight > 750) {
            doc.addPage();
            currentY = 40;
          }
        };

        const renderSectionHeader = (title: string) => {
          checkPageBreak(35);
          doc.font(fontBold).fontSize(12).fillColor('#71AB33').text(title, 40, currentY);
          currentY += 18;
          doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor('#E2E8F0').lineWidth(1).stroke();
          currentY += 12;
        };

        const renderKeyValue = (label: string, value: any, indent = 45) => {
          checkPageBreak(20);
          const valStr = value !== null && value !== undefined && value !== '' ? String(value) : '-';
          doc.font(fontBold).fontSize(9.5).fillColor('#333333').text(`${label}: `, indent, currentY, { continued: true });
          doc.font(fontRegular).fillColor('#1A202C').text(valStr);
          currentY += 16;
        };

        const renderImage = (imgUrl: string, indent = 45) => {
          if (!imgUrl) return;
          const imgPath = path.join(process.cwd(), 'public', imgUrl);
          if (fs.existsSync(imgPath)) {
            checkPageBreak(110);
            try {
              doc.image(imgPath, indent, currentY, { height: 95 });
              currentY += 105;
            } catch {
              doc.font(fontRegular).fontSize(9).fillColor('#666666').text(`[Ảnh đính kèm: ${imgUrl}]`, indent, currentY);
              currentY += 15;
            }
          } else {
            doc.font(fontRegular).fontSize(9).fillColor('#666666').text(`[Tệp đính kèm: ${imgUrl}]`, indent, currentY);
            currentY += 15;
          }
        };

        // IF COMPACT DATA AVAILABLE (Public/QR/Customer mode)
        if (traceData?.compactData) {
          const compact = traceData.compactData;
          const isExternal = Boolean(traceData.isExternal);

          if (!isExternal) {
            // === NỘI BỘ (INTERNAL) ===
            // I. THÔNG TIN CƠ SỞ CHÍNH
            renderSectionHeader('I. THÔNG TIN CƠ SỞ CHÍNH');
            renderKeyValue('Tên cơ sở (nhà yến)', compact.facilityName);
            renderKeyValue('Mã định danh cơ sở', compact.fiIdentificationCode);
            renderKeyValue('Địa chỉ sản xuất', compact.facilityAddress);
            renderKeyValue('Mã lô sản xuất', compact.lotcode);
            currentY += 10;

            // II. THÔNG TIN THU HOẠCH
            renderSectionHeader('II. THÔNG TIN THU HOẠCH');
            renderKeyValue('Số đợt thu hoạch', Array.isArray(compact.hiNumberHarvest) ? compact.hiNumberHarvest.join(', ') : compact.hiNumberHarvest);
            renderKeyValue('Số lượng tổ', compact.hmNumberNests ? `${compact.hmNumberNests} tổ` : '-');
            renderKeyValue('Khối lượng', compact.hmWeight ? `${compact.hmWeight} gram` : '-');

            if (compact.hmWeightingPhoto) {
              const photoUrl = typeof compact.hmWeightingPhoto === 'object' ? compact.hmWeightingPhoto?.url : compact.hmWeightingPhoto;
              if (photoUrl) {
                renderKeyValue('Ảnh cân thu hoạch', '');
                renderImage(photoUrl);
              }
            }
            currentY += 10;

            // III. NHẬT KÝ NHÀ YẾN
            renderSectionHeader('III. NHẬT KÝ NHÀ YẾN');

            // 1. Các việc đã thực hiện (SWIFT_HOUSE_TD)
            checkPageBreak(30);
            doc.font(fontBold).fontSize(10).fillColor('#2D3748').text('1. Các việc đã thực hiện:', 45, currentY);
            currentY += 16;
            const todoField = compact.todoListGroup?.fields?.find((f: any) => (f.fieldKey || '').toLowerCase().includes('todo') || f.fieldType === 'list_readonly');
            const todoItems = todoField?.currentValue;
            const todoSubFields = (todoField?.config && (Array.isArray(todoField.config.maps) ? todoField.config.maps : Array.isArray(todoField.config.fields) ? todoField.config.fields : [])) || [];

            if (Array.isArray(todoItems) && todoItems.length > 0) {
              todoItems.forEach((item: any, idx: number) => {
                checkPageBreak(18);
                if (todoSubFields.length > 0) {
                  const line = todoSubFields.map((sub: any) => `${sub.fieldName}: ${item[sub.fieldKey] || '-'}`).join(' | ');
                  doc
                    .font(fontRegular)
                    .fontSize(9)
                    .fillColor('#4A5568')
                    .text(`  ${idx + 1}. ${line}`, 55, currentY);
                } else {
                  const title = item.taskName || item.todoName || item.title || item.name || '-';
                  const status = item.taskStatus || item.todoStatus || item.status || '';
                  const time = item.taskDate || item.createdAt || item.time || '';
                  const details = [status, time].filter(Boolean).join(' - ');
                  doc
                    .font(fontRegular)
                    .fontSize(9)
                    .fillColor('#4A5568')
                    .text(`  ${idx + 1}. ${title}${details ? ` (${details})` : ''}`, 55, currentY);
                }
                currentY += 15;
              });
            } else {
              doc.font(fontRegular).fontSize(9).fillColor('#718096').text('  Chưa có dữ liệu việc thực hiện.', 55, currentY);
              currentY += 15;
            }
            currentY += 8;

            // 2. Lịch sử lăn thuốc (SWIFT_HOUSE_MEDICINE)
            checkPageBreak(30);
            doc.font(fontBold).fontSize(10).fillColor('#2D3748').text('2. Lịch sử lăn thuốc:', 45, currentY);
            currentY += 16;
            const medField = compact.medicineGroup?.fields?.find((f: any) => (f.fieldKey || '').toLowerCase().includes('medicine') || f.fieldType === 'list_readonly');
            const medItems = medField?.currentValue;
            const medSubFields = (medField?.config && (Array.isArray(medField.config.maps) ? medField.config.maps : Array.isArray(medField.config.fields) ? medField.config.fields : [])) || [];

            if (Array.isArray(medItems) && medItems.length > 0) {
              medItems.forEach((item: any, idx: number) => {
                checkPageBreak(18);
                if (medSubFields.length > 0) {
                  const line = medSubFields.map((sub: any) => `${sub.fieldName}: ${item[sub.fieldKey] || '-'}`).join(' | ');
                  doc
                    .font(fontRegular)
                    .fontSize(9)
                    .fillColor('#4A5568')
                    .text(`  ${idx + 1}. ${line}`, 55, currentY);
                } else {
                  const name = item.valueOption || item.medicineName || item.name || '-';
                  const dosage = item.medicineUsage || item.dosage || '';
                  const time = item.createdAt || item.date || '';
                  const detailStr = [`Tên: ${name}`, dosage ? `Liều lượng: ${dosage}` : '', time ? `Ngày: ${time}` : ''].filter(Boolean).join(' | ');
                  doc
                    .font(fontRegular)
                    .fontSize(9)
                    .fillColor('#4A5568')
                    .text(`  ${idx + 1}. ${detailStr}`, 55, currentY);
                }
                currentY += 15;
              });
            } else {
              doc.font(fontRegular).fontSize(9).fillColor('#718096').text('  Chưa có dữ liệu lăn thuốc.', 55, currentY);
              currentY += 15;
            }
          } else {
            // === MỞ RỘNG (EXTERNAL) ===
            // I. THÔNG TIN CƠ SỞ & THU HOẠCH BAN ĐẦU
            renderSectionHeader('I. THÔNG TIN CƠ SỞ & THU HOẠCH BAN ĐẦU');
            renderKeyValue('Mã lô liên kết', compact.lotcode);
            renderKeyValue('Mã định danh cơ sở', compact.formDataExtra?.fiIdentificationCode);
            renderKeyValue('Tên cơ sở (nhà yến)', compact.formDataExtra?.facilityName);
            renderKeyValue('Địa chỉ cơ sở', compact.formDataExtra?.facilityAddress);
            renderKeyValue('Thời gian bắt đầu hoạt động', compact.formDataExtra?.facilityActiveTime);
            renderKeyValue('Diện tích cơ sở', compact.formDataExtra?.facilityArea);
            renderKeyValue('Số tầng', compact.formDataExtra?.facilityFloor);
            renderKeyValue('Số lượng tổ', compact.formDataExtra?.hmNumberNests);
            currentY += 10;

            // II. TIẾP NHẬN NGUYÊN LIỆU & NHẬT KÝ SƠ CHẾ
            renderSectionHeader('II. TIẾP NHẬN NGUYÊN LIỆU & NHẬT KÝ SƠ CHẾ');
            renderKeyValue('Cơ sở thực hiện', compact.rmTeamExecution);
            renderKeyValue('Địa chỉ cơ sở', compact.rmAddress);
            currentY += 8;

            checkPageBreak(30);
            doc.font(fontBold).fontSize(10).fillColor('#2D3748').text('Nhật ký các công đoạn sơ chế:', 45, currentY);
            currentY += 16;

            const stages = compact.diaryProcessGroup?.loopValues;
            if (Array.isArray(stages) && stages.length > 0) {
              stages.forEach((stage: any, sIdx: number) => {
                checkPageBreak(45);
                doc
                  .font(fontBold)
                  .fontSize(9.5)
                  .fillColor('#71AB33')
                  .text(`• Công đoạn ${sIdx + 1}: ${stage.dpProcessName || '-'}`, 55, currentY);
                currentY += 16;
                const timeRange = [stage.dpProcessStartTime, stage.dpProcessEndTime].filter(Boolean).join('  đến  ');
                if (timeRange) renderKeyValue('Thời gian thực hiện', timeRange, 65);
                if (stage.dpProcesser) renderKeyValue('Người thực hiện', stage.dpProcesser, 65);

                const fileVal = stage.dpProcessFile;
                const fileUrl = typeof fileVal === 'object' ? fileVal?.url : fileVal;
                if (fileUrl) {
                  renderImage(fileUrl, 65);
                }
                currentY += 6;
              });
            } else {
              doc.font(fontRegular).fontSize(9).fillColor('#718096').text('  Chưa có dữ liệu công đoạn sơ chế.', 55, currentY);
              currentY += 15;
            }
            currentY += 10;

            // III. THÔNG TIN SẢN PHẨM & ĐÓNG GÓI
            renderSectionHeader('III. THÔNG TIN SẢN PHẨM & ĐÓNG GÓI');
            renderKeyValue('Tên sản phẩm', compact.pcProductName);
            renderKeyValue('Quy cách cơ bản', compact.pcBasicSpecification);
            renderKeyValue('Tiêu chuẩn áp dụng', compact.iiApplicableStandard);
            renderKeyValue('Hướng dẫn sử dụng', compact.iiInstructionUse);
          }
        } else {
          // SECTION 1: FACILITY / HOUSE INFO (Only if homeInfo exists)
          const hasHomeInfo = Boolean(traceData?.homeInfo);
          if (hasHomeInfo) {
            doc.font(fontBold).fontSize(12).fillColor('#71AB33').text('I. THÔNG TIN CƠ SỞ CHÍNH', 40, currentY);

            currentY += 20;

            doc.strokeColor('#71AB33').lineWidth(1).rect(40, currentY, 515, 80).stroke();

            const homeInfo = traceData.homeInfo;
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
          }

          // SECTION 2: FORMS & SUBMISSIONS
          const sectionTitle = hasHomeInfo ? 'II. NHẬT KÝ BIỂU MẪU TRUY XUẤT NGUỒN GỐC' : 'I. NHẬT KÝ BIỂU MẪU TRUY XUẤT NGUỒN GỐC';
          doc.font(fontBold).fontSize(12).fillColor('#71AB33').text(sectionTitle, 40, currentY);

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
                      if (field.fieldType === 'link_download') return;
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
                        } else if (field.fieldType === 'list_readonly' && Array.isArray(field.currentValue)) {
                          const subFields = (field.config && (Array.isArray(field.config.maps) ? field.config.maps : Array.isArray(field.config.fields) ? field.config.fields : [])) || [];
                          if (field.currentValue.length === 0) {
                            valStr = 'Không có dữ liệu';
                          } else {
                            valStr =
                              '\n' +
                              field.currentValue
                                .map((item: any, i: number) => {
                                  const line = subFields.map((sub: any) => `${sub.fieldName}: ${item[sub.fieldKey] || '-'}`).join(' | ');
                                  return `    ${i + 1}. ${line}`;
                                })
                                .join('\n');
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

                        const renderImageField = (imgUrl: string) => {
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

                        if (isImageSingle) renderImageField(imageUrl);
                        if (multipleImages.length > 0) {
                          multipleImages.forEach((img) => renderImageField(img));
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
