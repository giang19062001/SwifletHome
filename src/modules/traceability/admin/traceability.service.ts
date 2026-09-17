import { BadRequestException, Injectable } from '@nestjs/common';
import { TraceabilityAdminRepository } from './traceability.repository';
import { TRACE_CONST } from '../app/traceability.const';
import { Msg } from 'src/helpers/message.helper';
import { GetTraceabilityListAdminDto } from './traceability-admin.dto';

@Injectable()
export class TraceabilityAdminService {
  constructor(private readonly repository: TraceabilityAdminRepository) {}

  async getAllForms(): Promise<any[]> {
    return await this.repository.getAllForms();
  }

  async getListTraceabilitySubmissions(dto: GetTraceabilityListAdminDto): Promise<{ total: number; list: any[] }> {
    const total = await this.repository.getTotalTraceabilitySubmissions(dto);
    const rows = await this.repository.getListTraceabilitySubmissions(dto);
    const list = rows.map((r) => ({
      seq: r.seq,
      traceabilityCode: r.traceabilityId,
      userCode: r.userCode,
      userName: r.userName || '',
      userPhone: r.userPhone || '',
      userHomeCode: r.userHomeCode,
      userHomeName: r.userHomeName || '',
      userHomeAddress: r.userHomeAddress || '',
      status: r.status,
      statusLabel: TRACE_CONST.STATUS[r.status]?.text || '',
      qrUrl: r.qrUrl,
      traceabilityId: r.traceabilityId,
      harvestPhases: r.harvestPhases || null,
      hasForm8: Boolean(r.hasForm8),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
    return { total, list };
  }

  async updateSubmissionStatus(seq: number, status: string, updatedId: string): Promise<number> {
    return await this.repository.updateSubmissionStatus(seq, status, updatedId);
  }

  async getFormForGlobalView(traceabilityId: string): Promise<any> {
    const batch = await this.repository.getBatchByTraceabilityId(traceabilityId);
    let userHomeCode = batch?.userHomeCode;
    if (!userHomeCode) {
      const parts = traceabilityId.split('-');
      userHomeCode = parts.find((p) => p.startsWith('HOM')) || parts[parts.length - 1];
    }

    const homeInfo = await this.repository.getHomeInfoByUserHomeCode(userHomeCode);
    if (!homeInfo) {
      throw new BadRequestException({ message: Msg.HomeNotFound, data: null });
    }

    const rawForms = await this.repository.getAllForms();
    const formsWithSubmissions = await Promise.all(
      rawForms.map(async (form) => {
        const submission = await this.repository.getSubmissionByTraceabilityIdAndFormSeq(traceabilityId, form.seq);
        if (submission) {
          const files = await this.repository.getFilesByUniqueId(submission.uniqueId);
          let savedData: any = null;
          try {
            savedData = typeof submission.formData === 'string' ? JSON.parse(submission.formData) : submission.formData;
          } catch (e) {
            savedData = null;
          }

          const groups = await this.repository.getGroupsByFormSeq(form.seq);
          const fields = await this.repository.getFieldsByFormSeq(form.seq);

          const mappedGroups = groups.map((g) => {
            const groupFields = fields
              .filter((f) => f.groupSeq === g.seq)
              .map((f) => {
                let config: any = null;
                try {
                  config = typeof f.config === 'string' ? JSON.parse(f.config) : f.config;
                } catch (e) {
                  config = f.config;
                }

                let currentValue: any = null;
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
                  currentValue = savedData?.[g.groupKey]?.[f.fieldKey] ?? savedData?.[f.fieldKey] ?? null;
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

          return {
            seq: form.seq,
            formKey: form.formKey,
            formName: form.formName,
            formDescription: form.formDescription || null,
            hasData: true,
            submission: {
              seq: submission.seq,
              traceabilityCode: submission.traceabilityCode,
              status: submission.status,
              statusLabel: TRACE_CONST.STATUS[submission.status]?.text || '',
              uniqueId: submission.uniqueId,
              groups: mappedGroups,
              files: files.map((file) => ({
                seq: file.seq,
                filename: file.filename,
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
              })),
            },
          };
        }

        return {
          seq: form.seq,
          formKey: form.formKey,
          formName: form.formName,
          formDescription: form.formDescription || null,
          hasData: false,
          submission: null,
        };
      }),
    );

    return {
      traceabilityId,
      homeInfo: {
        userHomeCode: homeInfo.userHomeCode,
        userHomeName: homeInfo.userHomeName,
        userHomeAddress: homeInfo.userHomeAddress,
        userHomeLength: homeInfo.userHomeLength,
        userHomeWidth: homeInfo.userHomeWidth,
        userHomeFloor: homeInfo.userHomeFloor,
        userName: homeInfo.userName || '',
      },
      forms: formsWithSubmissions,
    };
  }
}
