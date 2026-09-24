import { BadRequestException, Injectable } from '@nestjs/common';
import { Msg } from 'src/helpers/message.helper';
import { TRACE_CONST } from '../common/traceability.const';
import { TraceabilityDisplayActorTypeEnum, TraceabilityStatusEnum } from '../common/traceability.enum';
import { GetTraceabilityListAdminDto } from './traceability-admin.dto';
import { TraceabilityFieldsAdminService } from './traceability-fields.service';
import { TraceabilityAdminRepository } from './traceability.repository';
import { TodoHarvestAppService } from 'src/modules/todo/app/todo-harvest.service';
import { IFormDataExtra } from '../common/traceability.interface';

@Injectable()
export class TraceabilityAdminService {
  constructor(
    private readonly repository: TraceabilityAdminRepository,
    private readonly fieldsService: TraceabilityFieldsAdminService,
    private readonly todoHarvestService: TodoHarvestAppService,
  ) {}

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
      hasFinalForm: Boolean(r.hasFinalForm),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
    return { total, list };
  }

  async updateSubmissionStatus(seq: number, status: TraceabilityStatusEnum, updatedId: string): Promise<number> {
    const batch = await this.repository.getBatchBySeq(seq);
    if (status === TraceabilityStatusEnum.APPROVED && batch?.harvestPhases) {
      await this.todoHarvestService.useTaskHarvestForTraceability(seq, updatedId);
    }
    return await this.repository.updateSubmissionStatus(seq, status, updatedId);
  }

  async getFormForGlobalView(traceabilityId: string, isCompact: boolean = false): Promise<any> {
    const isExternal = traceabilityId.includes(TRACE_CONST.TRACE_EXTERNAL_PREFIX);

    let homeInfo: any = null;
    let batch: any = null;
    let extraLinked: any = null;
    let lotcode = '';
    let formDataExtra: IFormDataExtra | null = null;

    if (isExternal) {
      batch = await this.repository.getBatchByTraceabilityIdExternal(traceabilityId);
      if (batch) {
        extraLinked = await this.repository.getExtraLinkedByBatchExternalSeq(batch.seq);
      }
      lotcode = extraLinked?.lotcode || batch?.lotcode || '';
      if (extraLinked?.formDataExtra) {
        try {
          formDataExtra = typeof extraLinked.formDataExtra === 'string' ? JSON.parse(extraLinked.formDataExtra) : extraLinked.formDataExtra;
        } catch (e) {
          formDataExtra = null;
        }
      }
      if (!formDataExtra) {
        formDataExtra = {
          fiIdentificationCode: '',
          facilityName: '',
          facilityAddress: '',
          facilityActiveTime: '',
          facilityArea: '',
          facilityFloor: '',
          hmNumberNests: '',
        };
      }
    } else {
      batch = await this.repository.getBatchByTraceabilityId(traceabilityId);
      lotcode = batch?.lotcode || '';
      let userHomeCode = batch?.userHomeCode;
      if (!userHomeCode) {
        const parts = traceabilityId.split('-');
        userHomeCode = parts.find((p) => p.startsWith('HOM')) || parts[parts.length - 1];
      }

      if (userHomeCode) {
        homeInfo = await this.repository.getHomeInfoByUserHomeCode(userHomeCode);
      }
      if (!homeInfo && !isCompact) {
        throw new BadRequestException({ message: Msg.HomeNotFound, data: null });
      }
    }

    let rawForms = await this.repository.getAllForms();
    if (isExternal) {
      rawForms = rawForms.filter((f) => f.displayActorType === TraceabilityDisplayActorTypeEnum.EXTERNAL || f.displayActorType === TraceabilityDisplayActorTypeEnum.BOTH);
    } else {
      rawForms = rawForms.filter((f) => f.displayActorType === TraceabilityDisplayActorTypeEnum.INTERNAL || f.displayActorType === TraceabilityDisplayActorTypeEnum.BOTH);
    }

    if (isCompact) {
      rawForms = rawForms.filter((f) => this.fieldsService.isFormAllowedInCompact(f.formKey, isExternal));
    }

    const formsWithSubmissions = await Promise.all(
      rawForms.map(async (form) => {
        const submission = isExternal
          ? await this.repository.getSubmissionByTraceabilityIdAndFormSeqExternal(traceabilityId, form.seq)
          : await this.repository.getSubmissionByTraceabilityIdAndFormSeq(traceabilityId, form.seq);

        if (submission) {
          const files = isExternal ? await this.repository.getFilesByUniqueIdExternal(submission.uniqueId) : await this.repository.getFilesByUniqueId(submission.uniqueId);

          let savedData: any = null;
          try {
            savedData = typeof submission.formData === 'string' ? JSON.parse(submission.formData) : submission.formData;
          } catch (e) {
            savedData = null;
          }

          const groups = await this.repository.getGroupsByFormSeq(form.seq);
          const fields = await this.repository.getFieldsByFormSeq(form.seq);

          let mappedGroups = this.fieldsService.mapGroupsAndFields(groups, fields, savedData, files);

          if (isCompact) {
            mappedGroups = this.fieldsService.filterGroupsForCompact(form.formKey, mappedGroups, isExternal);
          }

          const hasData = mappedGroups.some((g) => (g.fields && g.fields.length > 0) || (g.loopValues && g.loopValues.length > 0));

          return {
            seq: form.seq,
            formKey: form.formKey,
            formName: form.formName,
            formDescription: form.formDescription || null,
            hasData,
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

    const compactData = isCompact
      ? this.fieldsService.buildCompactData({
          isExternal,
          lotcode,
          formDataExtra,
          homeInfo,
          forms: formsWithSubmissions,
        })
      : null;

    return {
      traceabilityId,
      isExternal,
      lotcode,
      formDataExtra: isExternal ? formDataExtra : null,
      homeInfo: isExternal
        ? null
        : homeInfo
          ? {
              userHomeCode: homeInfo.userHomeCode,
              userHomeName: homeInfo.userHomeName,
              userHomeAddress: homeInfo.userHomeAddress,
              userHomeLength: homeInfo.userHomeLength,
              userHomeWidth: homeInfo.userHomeWidth,
              userHomeFloor: homeInfo.userHomeFloor,
              userName: homeInfo.userName || '',
            }
          : null,
      forms: formsWithSubmissions,
      compactData,
    };
  }
}
