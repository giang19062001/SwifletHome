import { BadRequestException, Injectable } from '@nestjs/common';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { getFileLocation } from 'src/config/multer.config';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';
import { GetFormDto, SubmitTraceabilityDto, UploadTraceabilityFilesDto } from './traceability.dto';
import { TraceabilityAppRepository } from './traceability.repository';
import { TraceabilityFormResDto, TraceabilityGroupResDto, TraceabilityFieldResDto, UploadTraceabilityFileResDto, TraceabilityHouseInfoResDto } from './traceability.response';
import { generateTraceabilityId, generateTraceabilityQr, generateTraceabilityQrLink } from './traceability.func';
import { TraceabilityStatusEnum } from './traceability.enum';
import { TRACE_CONST } from './traceability.const';
import { Msg } from 'src/helpers/message.helper';
import { TRACE_FORM_OPTIONS_SQL } from './traceability.query';

@Injectable()
export class TraceabilityAppService {
  constructor(
    private readonly repository: TraceabilityAppRepository,
    private readonly fileLocalService: FileLocalService,
  ) {}

  async getAllForms(): Promise<{ seq: number; formKey: string; formName: string; formDescription: string | null }[]> {
    const rows = await this.repository.getAllForms();
    return rows.map((r) => ({
      seq: r.seq,
      formKey: r.formKey,
      formName: r.formName,
      formDescription: r.formDescription || '',
    }));
  }

  async getForm(dto: GetFormDto, userCode: string): Promise<TraceabilityFormResDto> {
    const form = await this.repository.getFormByKey(dto.formKey);
    if (!form) {
      throw new BadRequestException({ message: Msg.FormNotFound, data: null });
    }

    const groups = await this.repository.getGroupsByFormSeq(form.seq);
    const fields = await this.repository.getFieldsByFormSeq(form.seq);

    let uniqueId = uuidv4();
    let traceabilityCode: string | null = null;
    let savedData: any = null;
    let files: any[] = [];
    let qrUrl: string | null = null;
    let traceabilityId: string | null = null;
    let status = 'PROCESSING';

    const provinceCode = await this.repository.getUserHomeProvince(dto.userHomeCode);
    if (!provinceCode) {
      throw new BadRequestException({ message: Msg.HomeNotFound, data: null });
    }

    traceabilityId = generateTraceabilityId(userCode, dto.userHomeCode);

    const submission = await this.repository.getSubmissionByUserHomeForm(userCode, dto.userHomeCode, form.seq);
    if (submission) {
      uniqueId = submission.uniqueId;
      traceabilityCode = submission.traceabilityCode;
      files = await this.repository.getFilesByUniqueId(uniqueId);
      qrUrl = submission.qrUrl || null;
      status = submission.status || 'PROCESSING';
      try {
        savedData = typeof submission.formData === 'string' ? JSON.parse(submission.formData) : submission.formData;
      } catch (e) {
        savedData = null;
      }
    }

    if (!qrUrl) {
      qrUrl = generateTraceabilityQr(userCode, dto.userHomeCode);
    }

    // Map fields to groups
    const mappedGroups: TraceabilityGroupResDto[] = groups.map((g) => {
      const groupFields: TraceabilityFieldResDto[] = fields
        .filter((f) => f.groupSeq === g.seq)
        .map((f) => {
          let config: any = null;
          try {
            config = typeof f.config === 'string' ? JSON.parse(f.config) : f.config;
          } catch (e) {
            config = f.config;
          }

          let currentValue: any = null;
          if (traceabilityCode) {
            if (f.fieldType === 'file_single') {
              const file = files.find((fileItem) => fileItem.fieldKey === f.fieldKey);
              currentValue = file
                ? {
                    seq: file.seq,
                    url: file.filename,
                  }
                : null;
            } else if (f.fieldType === 'file_multiple') {
              currentValue = files
                .filter((fileItem) => fileItem.fieldKey === f.fieldKey)
                .map((fileItem) => ({
                  seq: fileItem.seq,
                  url: fileItem.filename,
                }));
            } else {
              // Lấy từ JSON data (hỗ trợ cả nested groupKey và flat key)
              currentValue = savedData?.[g.groupKey]?.[f.fieldKey] ?? savedData?.[f.fieldKey] ?? null;
            }
          }

          return {
            fieldKey: f.fieldKey,
            fieldName: f.fieldName,
            fieldType: f.fieldType,
            isRequired: f.isRequired,
            config,
            currentValue,
          };
        });

      return {
        groupKey: g.groupKey,
        groupName: g.groupName,
        fields: groupFields,
      };
    });

    // Lấy các tùy chọn động cho các trường hỗ trợ thông qua TRACE_FORM_OPTIONS_SQL
    const dynamicOptionsPromises: Promise<void>[] = [];
    for (const group of mappedGroups) {
      for (const field of group.fields) {
        const sqlQuery = TRACE_FORM_OPTIONS_SQL[field.fieldKey as keyof typeof TRACE_FORM_OPTIONS_SQL];
        if (sqlQuery) {
          dynamicOptionsPromises.push(
            (async () => {
              try {
                const rows = await this.repository.getDynamicOptions(sqlQuery, userCode, dto.userHomeCode);
                const options = rows.map((row, idx) => {
                  return {
                    value: row.value,
                    label: row.label,
                    sortOrder: idx + 1,
                  };
                });

                if (!field.config) {
                  field.config = {};
                } else if (typeof field.config === 'string') {
                  try {
                    field.config = JSON.parse(field.config);
                  } catch (e) {
                    field.config = {};
                  }
                }

                field.config.options = options;
              } catch (error) {
                console.error(`Error fetching dynamic options for field "${field.fieldKey}":`, error);
                if (!field.config) {
                  field.config = { options: [] };
                } else {
                  field.config.options = [];
                }
              }
            })(),
          );
        }
      }
    }

    if (dynamicOptionsPromises.length > 0) {
      await Promise.all(dynamicOptionsPromises);
    }

    const response = new TraceabilityFormResDto();
    response.uniqueId = uniqueId;
    response.formKey = form.formKey;
    response.formName = form.formName;
    response.formDescription = form.formDescription || null;
    response.qrUrl = qrUrl;
    response.traceabilityId = traceabilityId;
    response.status = status;
    response.statusLabel = TRACE_CONST.STATUS[status]?.text || '';
    response.groups = mappedGroups;
    if (traceabilityCode) {
      response.traceabilityCode = traceabilityCode;
    }

    return response;
  }

  async uploadFiles(dto: UploadTraceabilityFilesDto, files: Express.Multer.File[], createdId: string): Promise<UploadTraceabilityFileResDto[]> {
    if (dto.fieldType === 'file_single') {
      await this.repository.deactivateFilesForFieldSingle(dto.uniqueId, dto.fieldKey);
    }

    const result = await Promise.all(
      files.map(async (file) => {
        const relativePath = `${getFileLocation(file.mimetype, file.fieldname)}/${file.filename}`;
        const seq = await this.repository.insertFile(dto.uniqueId, dto.fieldKey, dto.fieldType, relativePath, file.originalname, file.size, file.mimetype, createdId);
        return { seq, url: relativePath, mimetype: file.mimetype };
      }),
    );

    return result;
  }

  async deleteFile(seq: number, userCode: string): Promise<number> {
    const fileInfo = await this.repository.getFileBySeq(seq);
    if (!fileInfo || fileInfo.createdId !== userCode) {
      return 0;
    }

    if (fileInfo.filename) {
      await this.fileLocalService.deleteLocalFile(fileInfo.filename);
    }

    return await this.repository.deleteFileBySeq(seq);
  }

  async submit(dto: SubmitTraceabilityDto, userCode: string): Promise<number> {
    const isExist = await this.repository.checkExistUniqueId(dto.uniqueId);

    const formDataStr = JSON.stringify(dto.formData);

    if (isExist) {
      // Cập nhật form
      const [submission] = await (this.repository as any).db.execute(`SELECT seq, traceabilityCode FROM tbl_traceability_submissions WHERE uniqueId = ? LIMIT 1`, [dto.uniqueId]);
      if (submission && submission[0]) {
        const seq = submission[0].seq;
        await this.repository.updateSubmission(seq, formDataStr, userCode);
        await this.repository.bindFilesToSubmission(seq, dto.uniqueId, userCode);
        return 1;
      }
    }

    // Tạo mới form
    const traceabilityCode = await this.repository.generateTraceabilityCode();

    const provinceCode = await this.repository.getUserHomeProvince(dto.userHomeCode);
    if (!provinceCode) {
      throw new BadRequestException({ message: Msg.HomeNotFound, data: null });
    }

    const traceabilityId = generateTraceabilityId(userCode, dto.userHomeCode);
    const qrUrl = generateTraceabilityQr(userCode, dto.userHomeCode);
    const status = TraceabilityStatusEnum.PROCESSING;

    const insertId = await this.repository.insertSubmission(traceabilityCode, dto.formSeq, userCode, dto.userHomeCode, formDataStr, dto.uniqueId, status, qrUrl, traceabilityId, userCode);

    if (insertId) {
      await this.repository.bindFilesToSubmission(insertId, dto.uniqueId, userCode);
    }

    return 1;
  }

  async getFilesNotUse(): Promise<{ seq: number; filename: string }[]> {
    return await this.repository.getFilesNotUse();
  }

  async deleteFileCron(seq: number): Promise<number> {
    return await this.repository.deleteFileBySeq(seq);
  }

  async getTraceInfoEachHouse(userCode: string): Promise<TraceabilityHouseInfoResDto[]> {
    const houses = await this.repository.getUserHouses(userCode);

    const results = await Promise.all(
      houses.map(async (house) => {
        const userHomeCode = house.userHomeCode;
        const traceabilityId = generateTraceabilityId(userCode, userHomeCode);

        // Form đầu tiên trên App là 1. Chỉ cần dựa vào 1 form để biết nhà yến của user này đã có QR truy xuất hay chưa
        const submission = await this.repository.getSubmissionByUserHomeForm(userCode, userHomeCode, 1);

        let status = 'PROCESSING';
        let qrUrl: string | null = null;

        if (submission) {
          status = submission.status || 'PROCESSING';
          qrUrl = submission.qrUrl || null;
        }

        if (!qrUrl) {
          qrUrl = generateTraceabilityQr(userCode, userHomeCode);
          const dirPath = path.join(process.cwd(), 'public', TRACE_CONST.QR_CODE_PATH);
          if (!existsSync(dirPath)) {
            mkdirSync(dirPath, { recursive: true });
          }
          const fullPath = path.join(dirPath, `${traceabilityId}.png`);
          const targetUrl = generateTraceabilityQrLink(userCode, userHomeCode);
          await QRCode.toFile(fullPath, targetUrl, {
            width: 300,
            margin: 1,
          });
        }

        return {
          userCode,
          userHomeCode,
          userHomeName: house.userHomeName,
          userHomeAddress: house.userHomeAddress,
          qrUrl,
          traceabilityId,
          status,
          statusLabel: TRACE_CONST.STATUS[status]?.text || '',
          isMain: house.isMain || 'N',
        };
      }),
    );

    return results;
  }
}
