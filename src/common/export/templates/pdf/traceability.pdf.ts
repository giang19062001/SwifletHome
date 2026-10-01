import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';
import { PdfBaseService } from '../../services/pdf-base.service';

@Injectable()
export class TraceabilityPdfTemplate {
  constructor(private readonly pdfBaseService: PdfBaseService) {}

  async generateCompact(traceData: any, qrUrl?: string): Promise<Buffer> {
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
        doc
          .font(fontBold)
          .fontSize(14)
          .fillColor('#71AB33')
          .text(traceData?.isExternal ? 'HỆ THỐNG TRUY XUẤT SẢN PHẨM' : 'HỆ THỐNG TRUY XUẤT TỔ YẾN', 40, 40);
        doc
          .font(fontRegular)
          .fontSize(10)
          .fillColor('#555555')
          .text(traceData?.isExternal ? 'Hồ sơ điện tử truy xuất nguồn gốc sản phẩm' : 'Hồ sơ điện tử truy xuất nguồn gốc tổ yến', 40, 58);

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

        doc
          .font(fontBold)
          .fontSize(16)
          .fillColor('#000000')
          .text(traceData?.isExternal ? 'HỆ THỐNG TRUY XUẤT SẢN PHẨM' : 'HỆ THỐNG TRUY XUẤT TỔ YẾN', 40, currentY, { align: 'center' });
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
          const valStr = value !== null && value !== undefined && value !== '' ? String(value) : '-';
          const lines = valStr.split(/\r?\n/);
          checkPageBreak(16 * Math.max(1, lines.length));
          doc
            .font(fontBold)
            .fontSize(9.5)
            .fillColor('#333333')
            .text(`${label}: `, indent, currentY, { continued: lines.length > 1 ? false : true });
          if (lines.length > 1) {
            currentY += 15;
            lines.forEach((line) => {
              checkPageBreak(16);
              doc
                .font(fontRegular)
                .fontSize(9.5)
                .fillColor('#1A202C')
                .text(line, indent + 10, currentY);
              currentY += 15;
            });
            currentY += 2;
          } else {
            doc.font(fontRegular).fillColor('#1A202C').text(valStr);
            currentY += 16;
          }
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
            // I. THÔNG TIN NHÀ YẾN
            renderSectionHeader('I. THÔNG TIN NHÀ YẾN');
            renderKeyValue('Tên chủ sở hữu nhà yến', compact.personInCharge);
            renderKeyValue('Mã định danh nhà yến do bộ Nông Nghiệp cấp', compact.fiIdentificationCode);
            renderKeyValue('Địa chỉ sản xuất', compact.facilityAddress);
            currentY += 10;

            // II. THÔNG TIN THU HOẠCH
            renderSectionHeader('II. THÔNG TIN THU HOẠCH');
            renderKeyValue('Mã lô yến', compact.lotcode);
            renderKeyValue('Ngày thu hoạch', compact.hiHarvestDate);

            if (compact.hmWeightingPhoto) {
              const photoUrl = typeof compact.hmWeightingPhoto === 'object' ? compact.hmWeightingPhoto?.url : compact.hmWeightingPhoto;
              if (photoUrl) {
                renderKeyValue('Ảnh tổ yến thu hoạch', '');
                renderImage(photoUrl);
              }
            }
            currentY += 10;

            // III. NHẬT KÝ NHÀ YẾN
            renderSectionHeader('III. NHẬT KÝ CHĂM SÓC NHÀ YẾN');

            // 1. Các việc đã thực hiện (SWIFT_HOUSE_TD)
            checkPageBreak(30);
            doc.font(fontBold).fontSize(10).fillColor('#2D3748').text('Các việc đã thực hiện:', 45, currentY);
            currentY += 16;
            const todoField = compact.todoListGroup?.fields?.find((f: any) => (f.fieldKey || '').toLowerCase().includes('todo') || f.fieldType === 'list_canwrite');
            const todoItems = todoField?.currentValue;
            const todoSubFields = (todoField?.config && (Array.isArray(todoField.config.maps) ? todoField.config.maps : Array.isArray(todoField.config.fields) ? todoField.config.fields : [])) || [];

            if (Array.isArray(todoItems) && todoItems.length > 0) {
              todoItems.forEach((item: any, idx: number) => {
                let lineStr = '';
                if (todoSubFields.length > 0) {
                  lineStr = todoSubFields.map((sub: any) => `${sub.fieldName}: ${item[sub.fieldKey] || '-'}`).join(' | ');
                } else {
                  const title = item.taskName || item.todoName || item.title || item.name || '-';
                  const time = item.taskDate || item.createdAt || item.time || '';
                  const details = [time].filter(Boolean).join(' - ');
                  lineStr = `${title}${details ? ` (${details})` : ''}`;
                }

                const fullItemText = `  ${idx + 1}. ${lineStr}`;
                const itemHeight = doc.font(fontRegular).fontSize(9).heightOfString(fullItemText, { width: 490 });
                checkPageBreak(itemHeight + 4);

                doc.font(fontRegular).fontSize(9).fillColor('#4A5568').text(fullItemText, 55, currentY, { width: 490 });

                currentY = Math.max(currentY + 15, doc.y + 4);
              });
            } else {
              doc.font(fontRegular).fontSize(9).fillColor('#718096').text('  Chưa có dữ liệu việc thực hiện.', 55, currentY);
              currentY += 15;
            }
            currentY += 8;
          } else {
            // I. THÔNG TIN NHÀ SẢN XUẤT (MANUFACTURER)
            renderSectionHeader('I. THÔNG TIN NHÀ SẢN XUẤT');
            renderKeyValue('Tên nhà sản xuất', compact.mFacilityName);
            renderKeyValue('Địa chỉ', compact.mFacilityAddress);

            const certVal = compact.mCertificationFile || compact.fiCertificationFile;
            if (certVal) {
              let certFiles: string[] = [];
              if (Array.isArray(certVal)) {
                certFiles = certVal.map((f: any) => (typeof f === 'object' ? f?.url : f)).filter(Boolean);
              } else if (certVal) {
                const singleUrl = typeof certVal === 'object' ? certVal?.url : certVal;
                if (singleUrl) certFiles.push(singleUrl);
              }
              if (certFiles.length > 0) {
                let hostDomain = '';
                if (qrContent) {
                  try {
                    const parsedUrl = new URL(qrContent);
                    hostDomain = parsedUrl.origin;
                  } catch (e) {
                    hostDomain = '';
                  }
                }
                checkPageBreak(20);
                doc.font(fontBold).fontSize(9.5).fillColor('#333333').text('Hồ sơ pháp lý', 45, currentY);
                currentY += 16;
                certFiles.forEach((fileUrl: string) => {
                  checkPageBreak(18);
                  const fullUrl = `${hostDomain}/${fileUrl.replace(/^\/+/, '')}`;
                  doc.font(fontRegular).fontSize(8.5).fillColor('#2B6CB0').text(`  • ${fullUrl}`, 55, currentY);
                  currentY += 15;
                });
              }
            }
            currentY += 10;

            // II. NGUỒN GỐC NGUYÊN LIỆU (ORIGIN_NEST)
            renderSectionHeader('II. NGUỒN GỐC NGUYÊN LIỆU');

            const nestLots = compact.originNestGroup?.loopValues;
            if (Array.isArray(nestLots) && nestLots.length > 0) {
              nestLots.forEach((lot: any, lIdx: number) => {
                checkPageBreak(50);
                doc
                  .font(fontBold)
                  .fontSize(9.5)
                  .fillColor('#71AB33')
                  .text(`• Lô nguyên liệu ${lIdx + 1}`, 55, currentY);
                currentY += 16;
                if (lot.onAddressArea || compact.facilityAddress) {
                  renderKeyValue('Địa chỉ khu vực sản xuất/ thu hoạch', lot.onAddressArea || compact.facilityAddress, 65);
                }
                if (lot.onHarvestDate || compact.hiHarvestDate) {
                  renderKeyValue('Ngày thu hoạch', lot.onHarvestDate || compact.hiHarvestDate, 65);
                }

                const photoVal = lot.onWeightingPhoto;
                const photoUrl = typeof photoVal === 'object' ? photoVal?.url : photoVal;
                if (photoUrl) {
                  renderKeyValue('Ảnh cân tổ yến thu hoạch', '', 65);
                  renderImage(photoUrl, 65);
                }
                currentY += 6;
              });
            } else {
              renderKeyValue('Địa chỉ khu vực sản xuất/ thu hoạch', compact.onAddressArea || compact.facilityAddress);
              renderKeyValue('Ngày thu hoạch', compact.onHarvestDate || compact.hiHarvestDate);

              if (compact.onWeightingPhoto) {
                const photoUrl = typeof compact.onWeightingPhoto === 'object' ? compact.onWeightingPhoto?.url : compact.onWeightingPhoto;
                if (photoUrl) {
                  renderKeyValue('Ảnh cân tổ yến thu hoạch', '');
                  renderImage(photoUrl);
                }
              }
            }
            currentY += 10;

            // III. SƠ CHẾ & CHẾ BIẾN (PRE_PROCESSING)
            renderSectionHeader('III. SƠ CHẾ & CHẾ BIẾN');
            currentY += 8;

            const stages = compact.diaryProcessGroup?.loopValues;
            if (Array.isArray(stages) && stages.length > 0) {
              checkPageBreak(30);
              doc.font(fontBold).fontSize(10).fillColor('#2D3748').text('Nhật ký các công đoạn:', 45, currentY);
              currentY += 16;

              stages.forEach((stage: any, sIdx: number) => {
                checkPageBreak(50);
                doc
                  .font(fontBold)
                  .fontSize(9.5)
                  .fillColor('#71AB33')
                  .text(`• Công đoạn ${sIdx + 1}: ${stage.dpProcessName || '-'}`, 55, currentY);
                currentY += 16;
                if (stage.dpProcessTime) renderKeyValue('Ngày thực hiện', stage.dpProcessTime, 65);
                if (stage.dpProcesser) renderKeyValue('Người thực hiện', stage.dpProcesser, 65);
                if (stage.dpAddress) renderKeyValue('Địa điểm', stage.dpAddress, 65);
                if (stage.dpNote) renderKeyValue('Ghi chú', stage.dpNote, 65);

                const fileVal = stage.dpProcessFile;
                const fileUrl = typeof fileVal === 'object' ? fileVal?.url : fileVal;
                if (fileUrl) {
                  renderImage(fileUrl, 65);
                }
                currentY += 6;
              });
            }
            currentY += 10;

            // IV. THÔNG TIN SẢN PHẨM (PACKING_QR)
            renderSectionHeader('IV. THÔNG TIN SẢN PHẨM');
            renderKeyValue('Thành phần', compact.iiIngredients);
            renderKeyValue('Tiêu chuẩn áp dụng', compact.iiApplicableStandard);
            renderKeyValue('Hướng dẫn sử dụng', compact.iiInstructionUse);
            renderKeyValue('Giá trị dinh dưỡng', compact.iiNutritionalValue);
            renderKeyValue('Hướng dẫn bảo quản', compact.iiStorageInstruction);
            renderKeyValue('Cảnh báo', compact.iiWarning);
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
                      if (field.fieldType === 'link_download' || field.fieldType === 'link_share') return;
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
                        } else if (field.fieldType === 'list_canwrite' && Array.isArray(field.currentValue)) {
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
                        currentY = Math.max(currentY + 15, doc.y + 4);
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

  async generateFull(traceData: any, qrUrl?: string): Promise<Buffer> {
    const traceId = traceData?.traceabilityId || 'N/A';
    const lotcode = traceData?.lotcode || '';
    const isExternal = Boolean(traceData?.isExternal);

    const baseUrl = (process.env.CURRENT_URL ?? '').replace(/\/$/, '');
    const qrContent = qrUrl || (traceId !== 'N/A' ? `${baseUrl}/traceability-link-global/${traceId}` : '');

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
        doc
          .font(fontBold)
          .fontSize(14)
          .fillColor('#71AB33')
          .text(isExternal ? 'HỆ THỐNG TRUY XUẤT SẢN PHẨM' : 'HỆ THỐNG TRUY XUẤT TỔ YẾN', 40, 40);
        doc
          .font(fontRegular)
          .fontSize(10)
          .fillColor('#555555')
          .text(isExternal ? 'Hồ sơ điện tử truy xuất nguồn gốc sản phẩm' : 'Hồ sơ điện tử truy xuất nguồn gốc tổ yến', 40, 58);

        // Line under header
        doc.moveTo(40, 75).lineTo(555, 75).strokeColor('#71AB33').lineWidth(1.5).stroke();

        let currentY = 95;

        // QR CODE
        if (qrBuffer) {
          try {
            doc.image(qrBuffer, 475, 85, { width: 80 });
          } catch {
            // ignore image placement errors
          }
        }

        // TITLE
        doc.font(fontBold).fontSize(15).fillColor('#1A202C').text('HỒ SƠ CHI TIẾT TRUY XUẤT NGUỒN GỐC', 40, currentY, { align: 'center' });
        doc
          .font(fontRegular)
          .fontSize(10)
          .fillColor('#4A5568')
          .text(`Mã tra cứu: ${traceId}`, 40, currentY + 22, { align: 'center' });
        if (lotcode) {
          doc
            .font(fontRegular)
            .fontSize(10)
            .fillColor('#4A5568')
            .text(`Mã lô: ${lotcode}`, 40, currentY + 38, { align: 'center' });
        }
        doc
          .font(fontRegular)
          .fontSize(9)
          .fillColor('#718096')
          .text(`Ngày xuất file: ${new Date().toLocaleString('vi-VN')}`, 40, currentY + (lotcode ? 54 : 38), { align: 'center' });

        currentY += lotcode ? 78 : 62;

        const checkPageBreak = (neededHeight: number = 30) => {
          if (currentY + neededHeight > 750) {
            doc.addPage();
            currentY = 40;
            doc.font(fontRegular).fontSize(7.5).fillColor('#A0AEC0').text(`3FAM - Hồ sơ chi tiết TXNG: ${traceId}`, 40, 25, { width: 515, align: 'right' });
            doc.moveTo(40, 35).lineTo(555, 35).strokeColor('#E2E8F0').lineWidth(0.5).stroke();
            return true;
          }
          return false;
        };

        const renderSectionHeader = (title: string) => {
          checkPageBreak(35);
          doc.font(fontBold).fontSize(11.5).fillColor('#71AB33').text(title, 40, currentY);
          currentY += 16;
          doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor('#E2E8F0').lineWidth(1).stroke();
          currentY += 10;
        };

        const renderKeyValue = (label: string, value: any, indent = 45) => {
          const valStr = value !== null && value !== undefined && value !== '' ? String(value) : '-';
          const lines = valStr.split(/\r?\n/);
          checkPageBreak(16 * Math.max(1, lines.length));
          doc
            .font(fontBold)
            .fontSize(9)
            .fillColor('#2D3748')
            .text(`${label}: `, indent, currentY, { continued: lines.length > 1 ? false : true });
          if (lines.length > 1) {
            currentY += 14;
            lines.forEach((line) => {
              checkPageBreak(15);
              doc
                .font(fontRegular)
                .fontSize(9)
                .fillColor('#1A202C')
                .text(line, indent + 10, currentY, { width: 555 - (indent + 10) });
              currentY = Math.max(currentY + 14, doc.y + 2);
            });
            currentY += 2;
          } else {
            doc
              .font(fontRegular)
              .fillColor('#1A202C')
              .text(valStr, { width: 555 - indent });
            currentY = Math.max(currentY + 15, doc.y + 2);
          }
        };

        const renderImage = (imgUrl: string, indent = 45) => {
          if (!imgUrl) return;
          const cleanUrl = imgUrl.replace(/^\/+/, '');
          const imgPath = path.join(process.cwd(), 'public', cleanUrl);
          if (fs.existsSync(imgPath)) {
            checkPageBreak(105);
            try {
              doc.image(imgPath, indent, currentY, { height: 90, fit: [180, 90] });
              currentY += 98;
            } catch {
              doc.font(fontRegular).fontSize(8.5).fillColor('#64748B').text(`[Ảnh đính kèm: ${imgUrl}]`, indent, currentY);
              currentY += 14;
            }
          } else {
            const hostDomain = baseUrl || '';
            const fullLink = hostDomain ? `${hostDomain}/${cleanUrl}` : cleanUrl;
            doc.font(fontRegular).fontSize(8.5).fillColor('#2563EB').text(`[Tệp đính kèm: ${fullLink}]`, indent, currentY);
            currentY += 14;
          }
        };

        const renderTable = (headers: { key: string; name: string }[], items: any[], indent = 45) => {
          if (!items || items.length === 0 || !headers || headers.length === 0) {
            doc.font(fontRegular).fontSize(8.5).fillColor('#A0AEC0').text('Không có dữ liệu', indent, currentY);
            currentY += 14;
            return;
          }

          const tableWidth = 555 - indent;
          const indexColWidth = 28;
          const colWidth = (tableWidth - indexColWidth) / headers.length;

          // Header Row
          checkPageBreak(25);
          doc.rect(indent, currentY, tableWidth, 20).fillAndStroke('#F1F5F9', '#CBD5E1');

          doc
            .font(fontBold)
            .fontSize(8)
            .fillColor('#334155')
            .text('#', indent + 2, currentY + 5, { width: indexColWidth - 4, align: 'center' });
          headers.forEach((h, hIdx) => {
            const colX = indent + indexColWidth + hIdx * colWidth;
            doc
              .font(fontBold)
              .fontSize(8)
              .fillColor('#334155')
              .text(h.name || h.key, colX + 4, currentY + 5, { width: colWidth - 8, align: 'left' });
          });
          currentY += 20;

          // Data Rows
          items.forEach((item, rIdx) => {
            let maxCellHeight = 16;
            headers.forEach((h) => {
              const val = item && typeof item === 'object' ? (item[h.key] ?? '-') : '-';
              const textH = doc
                .font(fontRegular)
                .fontSize(8)
                .heightOfString(String(val), { width: colWidth - 8 });
              if (textH + 8 > maxCellHeight) {
                maxCellHeight = textH + 8;
              }
            });

            checkPageBreak(maxCellHeight);

            if (rIdx % 2 === 1) {
              doc.rect(indent, currentY, tableWidth, maxCellHeight).fillColor('#F8FAFC').fill();
            }
            doc.rect(indent, currentY, tableWidth, maxCellHeight).strokeColor('#E2E8F0').lineWidth(0.5).stroke();

            doc
              .font(fontRegular)
              .fontSize(8)
              .fillColor('#475569')
              .text(String(rIdx + 1), indent + 2, currentY + 4, { width: indexColWidth - 4, align: 'center' });

            headers.forEach((h, hIdx) => {
              const colX = indent + indexColWidth + hIdx * colWidth;
              const val = item && typeof item === 'object' ? (item[h.key] ?? '-') : '-';
              doc
                .font(fontRegular)
                .fontSize(8)
                .fillColor('#1E293B')
                .text(String(val), colX + 4, currentY + 4, { width: colWidth - 8, align: 'left' });
            });

            currentY += maxCellHeight;
          });
          currentY += 6;
        };

        const renderField = (field: any, val: any, indent = 45) => {
          if (!field || field.fieldType === 'link_download' || field.fieldType === 'link_share') return;

          const fieldName = field.fieldName || field.fieldKey || 'Trường dữ liệu';

          // 1. File Single
          if (field.fieldType === 'file_single') {
            const fileUrl = val && typeof val === 'object' && val.url ? val.url : typeof val === 'string' ? val : null;
            checkPageBreak(20);
            doc.font(fontBold).fontSize(9).fillColor('#2D3748').text(`${fieldName}:`, indent, currentY);
            currentY += 14;
            if (fileUrl) {
              const isImg = fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/i);
              if (isImg) {
                renderImage(fileUrl, indent + 10);
              } else {
                const cleanUrl = fileUrl.replace(/^\/+/, '');
                const fullLink = baseUrl ? `${baseUrl}/${cleanUrl}` : cleanUrl;
                doc
                  .font(fontRegular)
                  .fontSize(8.5)
                  .fillColor('#2563EB')
                  .text(`[Tệp đính kèm: ${fullLink}]`, indent + 10, currentY);
                currentY += 14;
              }
            } else {
              doc
                .font(fontRegular)
                .fontSize(8.5)
                .fillColor('#A0AEC0')
                .text('Chưa có tệp đính kèm', indent + 10, currentY);
              currentY += 14;
            }
            return;
          }

          // 2. File Multiple
          if (field.fieldType === 'file_multiple') {
            const files = Array.isArray(val) ? val : [];
            checkPageBreak(20);
            doc.font(fontBold).fontSize(9).fillColor('#2D3748').text(`${fieldName}:`, indent, currentY);
            currentY += 14;

            if (files.length > 0) {
              files.forEach((file: any) => {
                const fileUrl = file && typeof file === 'object' && file.url ? file.url : typeof file === 'string' ? file : null;
                if (fileUrl) {
                  const isImg = fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/i);
                  if (isImg) {
                    renderImage(fileUrl, indent + 10);
                  } else {
                    const cleanUrl = fileUrl.replace(/^\/+/, '');
                    const fullLink = baseUrl ? `${baseUrl}/${cleanUrl}` : cleanUrl;
                    doc
                      .font(fontRegular)
                      .fontSize(8.5)
                      .fillColor('#2563EB')
                      .text(`[Tệp đính kèm: ${fullLink}]`, indent + 10, currentY);
                    currentY += 14;
                  }
                }
              });
            } else {
              doc
                .font(fontRegular)
                .fontSize(8.5)
                .fillColor('#A0AEC0')
                .text('Chưa có tệp đính kèm', indent + 10, currentY);
              currentY += 14;
            }
            return;
          }

          // 3. Table / List canwrite
          let listItems = val;
          if (typeof listItems === 'string' && (listItems.trim().startsWith('[') || listItems.trim().startsWith('{'))) {
            try {
              listItems = JSON.parse(listItems);
            } catch (e) {}
          }
          const isTable = field.fieldType === 'list_canwrite' || (Array.isArray(listItems) && listItems.length > 0 && typeof listItems[0] === 'object' && listItems[0] !== null && !listItems[0].url);

          if (isTable) {
            let subFields: Array<{ key: string; name: string }> = [];
            let conf = field.config;
            if (typeof conf === 'string') {
              try {
                conf = JSON.parse(conf);
              } catch (e) {
                conf = {};
              }
            }
            if (conf) {
              const maps = Array.isArray(conf.maps) ? conf.maps : Array.isArray(conf.fields) ? conf.fields : Array.isArray(conf.columns) ? conf.columns : [];
              subFields = maps.map((m: any) => ({ key: m.fieldKey || m.key, name: m.fieldName || m.label || m.fieldKey || m.key }));
            }
            if (subFields.length === 0 && Array.isArray(listItems) && listItems.length > 0) {
              const keyMap = new Map();
              listItems.forEach((it: any) => {
                if (it && typeof it === 'object') {
                  Object.keys(it).forEach((k) => {
                    if (!keyMap.has(k)) {
                      keyMap.set(k, { key: k, name: k });
                    }
                  });
                }
              });
              subFields = Array.from(keyMap.values());
            }

            checkPageBreak(25);
            doc.font(fontBold).fontSize(9).fillColor('#2D3748').text(`${fieldName}:`, indent, currentY);
            currentY += 14;

            renderTable(subFields, Array.isArray(listItems) ? listItems : [], indent + 5);
            return;
          }

          // 4. Các trường dữ liệu thông thường
          let valStr = '';
          if (val !== null && val !== undefined && val !== '') {
            if (Array.isArray(val)) {
              valStr = val.map((v) => (typeof v === 'object' && v !== null ? v.label || v.name || v.title || v.value || JSON.stringify(v) : String(v))).join(', ');
            } else if (typeof val === 'object' && val !== null) {
              valStr = val.label || val.name || val.title || val.value || JSON.stringify(val);
            } else {
              valStr = String(val);
            }
          } else {
            valStr = '-';
          }

          renderKeyValue(fieldName, valStr, indent);
        };

        // SECTION I: THÔNG TIN CƠ SỞ CHÍNH
        const hasHomeInfo = Boolean(traceData?.homeInfo);
        if (hasHomeInfo) {
          renderSectionHeader('I. THÔNG TIN CƠ SỞ CHÍNH');

          const homeInfo = traceData.homeInfo;
          renderKeyValue('Tên nhà yến', homeInfo.userHomeName || 'N/A', 45);
          renderKeyValue('Chủ sở hữu', homeInfo.userName || 'N/A', 45);
          renderKeyValue('Địa chỉ sản xuất', homeInfo.userHomeAddress || 'N/A', 45);

          const dimensions = [
            homeInfo.userHomeLength ? `Dài ${homeInfo.userHomeLength}m` : '',
            homeInfo.userHomeWidth ? `Rộng ${homeInfo.userHomeWidth}m` : '',
            homeInfo.userHomeFloor ? `${homeInfo.userHomeFloor} tầng` : '',
          ]
            .filter(Boolean)
            .join(', ');
          if (dimensions) {
            renderKeyValue('Quy mô nhà yến', dimensions, 45);
          }
          currentY += 10;
        }

        // SECTION II: NHẬT KÝ BIỂU MẪU TRUY XUẤT NGUỒN GỐC
        const sectionTitle = hasHomeInfo ? 'II. NHẬT KÝ BIỂU MẪU TRUY XUẤT NGUỒN GỐC' : 'I. NHẬT KÝ BIỂU MẪU TRUY XUẤT NGUỒN GỐC';
        renderSectionHeader(sectionTitle);

        const forms = traceData?.forms || [];
        if (forms.length === 0) {
          doc.font(fontRegular).fontSize(9.5).fillColor('#718096').text('Chưa có thông tin biểu mẫu.', 45, currentY);
          currentY += 16;
        } else {
          forms.forEach((form: any, fIdx: number) => {
            checkPageBreak(45);

            // Form Title Banner
            const formTitle = `${fIdx + 1}. ${form.formName || 'Biểu mẫu'}`;
            doc.fillColor('#F4F9EE').strokeColor('#71AB33').lineWidth(1).rect(40, currentY, 515, 24).fillAndStroke();
            doc
              .font(fontBold)
              .fontSize(10)
              .fillColor('#2E7D32')
              .text(formTitle, 48, currentY + 6, { width: 500 });
            currentY += 30;

            if (form.formDescription) {
              checkPageBreak(18);
              doc.font(fontRegular).fontSize(8.5).fillColor('#64748B').text(form.formDescription, 48, currentY, { width: 500 });
              currentY += doc.heightOfString(form.formDescription, { width: 500 }) + 6;
            }

            if (form.hasData && form.submission?.groups && form.submission.groups.length > 0) {
              form.submission.groups.forEach((group: any) => {
                checkPageBreak(25);

                if (group.groupName && group.groupName.trim() !== '') {
                  doc.font(fontBold).fontSize(9.5).fillColor('#1E3A8A').text(`▸ ${group.groupName}`, 48, currentY);
                  currentY += 16;
                }

                if (group.isLoop === 'Y' && Array.isArray(group.loopValues) && group.loopValues.length > 0) {
                  const loopTitle = group.loopMetadata && group.loopMetadata.title ? group.loopMetadata.title : 'Công đoạn';
                  group.loopValues.forEach((stage: any, sIdx: number) => {
                    checkPageBreak(30);
                    doc
                      .font(fontBold)
                      .fontSize(9)
                      .fillColor('#71AB33')
                      .text(`• ${loopTitle} ${sIdx + 1}:`, 55, currentY);
                    currentY += 15;

                    if (Array.isArray(group.fields)) {
                      group.fields.forEach((field: any) => {
                        const val = stage[field.fieldKey];
                        renderField(field, val, 65);
                      });
                    }
                    currentY += 4;
                  });
                } else if (group.isLoop === 'Y') {
                  doc.font(fontRegular).fontSize(8.5).fillColor('#A0AEC0').text('  Chưa có dữ liệu ghi nhận.', 55, currentY);
                  currentY += 14;
                } else {
                  if (Array.isArray(group.fields)) {
                    group.fields.forEach((field: any) => {
                      renderField(field, field.currentValue, 55);
                    });
                  }
                }
                currentY += 6;
              });
            } else {
              doc.font(fontRegular).fontSize(8.5).fillColor('#A0AEC0').text('Chưa có dữ liệu ghi nhận cho biểu mẫu này.', 48, currentY);
              currentY += 15;
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
