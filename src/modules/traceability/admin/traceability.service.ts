import { BadRequestException, Injectable } from '@nestjs/common';
import { Msg } from 'src/helpers/message.helper';
import { TRACE_CONST } from '../common/traceability.const';
import { TraceabilityDisplayActorTypeEnum, TraceabilityStatusEnum } from '../common/traceability.enum';
import { GetTraceabilityListAdminDto } from './traceability-admin.dto';
import { TraceabilityFieldsAdminService } from './traceability-fields.service';
import { TraceabilityAdminRepository } from './traceability.repository';
import { TodoHarvestAppService } from 'src/modules/todo/app/todo-harvest.service';

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
    // đánh dấu sử dụng các đợt thu hoạch khi đơn truy xuất chứa các đợt thu hoạch đó được duyệt
    // if (status == TraceabilityStatusEnum.APPROVED) {
    //   this.todoHarvestService.useTaskHarvestForTraceability(seq, updatedId);
    // }
    return await this.repository.updateSubmissionStatus(seq, status, updatedId);
  }

  async getFormForGlobalView(traceabilityId: string): Promise<any> {
    const isExternal = traceabilityId.includes(TRACE_CONST.TRACE_EXTERNAL_PREFIX);

    let homeInfo: any = null;
    if (!isExternal) {
      const batch = await this.repository.getBatchByTraceabilityId(traceabilityId);
      let userHomeCode = batch?.userHomeCode;
      if (!userHomeCode) {
        const parts = traceabilityId.split('-');
        userHomeCode = parts.find((p) => p.startsWith('HOM')) || parts[parts.length - 1];
      }

      homeInfo = await this.repository.getHomeInfoByUserHomeCode(userHomeCode);
      if (!homeInfo) {
        throw new BadRequestException({ message: Msg.HomeNotFound, data: null });
      }
    }

    let rawForms = await this.repository.getAllForms();
    if (isExternal) {
      rawForms = rawForms.filter((f) => f.displayActorType === TraceabilityDisplayActorTypeEnum.EXTERNAL || f.displayActorType === TraceabilityDisplayActorTypeEnum.BOTH);
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

          const mappedGroups = this.fieldsService.mapGroupsAndFields(groups, fields, savedData, files);

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
      homeInfo: isExternal
        ? null
        : {
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
