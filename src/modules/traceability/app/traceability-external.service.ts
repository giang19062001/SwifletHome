import { BadRequestException, Injectable } from '@nestjs/common';
import { RowDataPacket } from 'mysql2';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { YnEnum } from 'src/interfaces/admin.interface';
import { getFileLocation } from 'src/config/multer.config';
import { v4 as uuidv4 } from 'uuid';
import { GetFormDto, GetSubmissionBatchListDto, SubmitTraceabilityDto, UploadTraceabilityFilesDto } from './traceability.dto';
import { TraceabilityExternalRepository } from './traceability-external.repository';
import { TraceabilityFormResDto, TraceabilityGroupResDto, UploadTraceabilityFileResDto, TraceabilityBatchItemResDto, TraceabilityBatchListResDto } from './traceability.response';
import { TraceabilityStatusEnum } from '../common/traceability.enum';
import { TRACE_CONST } from '../common/traceability.const';
import { Msg } from 'src/helpers/message.helper';
import { TraceabilityFieldsService } from './traceability-fields.service';
import * as path from 'path';
import * as QRCode from 'qrcode';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class TraceabilityExternalService {
  constructor(
    private readonly repository: TraceabilityExternalRepository,
    private readonly fileLocalService: FileLocalService,
    private readonly traceabilityFieldsService: TraceabilityFieldsService,
  ) {}

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
    let traceabilityId: string | null = dto?.traceabilityId || null;
    let status = TraceabilityStatusEnum.PROCESSING;

    let submission: RowDataPacket | null = null;
    // TODO: traceabilityId là optional
    if (dto.traceabilityId) {
      // có traceabilityId -> gọi lấy giá trị hiện tại
      submission = await this.repository.getSubmissionByTraceabilityIdAndFormSeq(dto.traceabilityId, form.seq, userCode);
      if (submission) {
        uniqueId = submission.uniqueId;
        traceabilityCode = submission.traceabilityCode;
        files = await this.repository.getFilesByUniqueId(uniqueId);
        qrUrl = submission.qrUrl || null;
        traceabilityId = submission.traceabilityId || null;
        status = submission.status || TraceabilityStatusEnum.PROCESSING;
        try {
          savedData = typeof submission.formData === 'string' ? JSON.parse(submission.formData) : submission.formData;
        } catch (e) {
          savedData = null;
        }
      } else {
        savedData = null;
      }
    } else {
      // Ko có traceabilityId -> tạo mới
      const processingBatch = await this.repository.createBatch(userCode, userCode);
      traceabilityId = processingBatch.traceabilityId;
      qrUrl = processingBatch.qrUrl;
      status = TraceabilityStatusEnum.PROCESSING;
    }

    // Map fields to groups
    const mappedGroups: TraceabilityGroupResDto[] = await this.traceabilityFieldsService.mapGroupsAndFields(groups, fields, savedData, files, traceabilityCode, traceabilityId, YnEnum.Y);

    // Kiểm tra QR
    // Kiểm tra QR code PNG file đã tồn tại trên ổ đĩa chưa, nếu chưa thì tạo ở background (không await để tránh blocking API response)
    const dirPath = path.join(process.cwd(), 'public', TRACE_CONST.QR_CODE_PATH_EXTERNAL);
    const fullPath = path.join(dirPath, `${traceabilityId}.png`);
    if (!existsSync(fullPath)) {
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
      }
      const targetUrl = `${process.env.CURRENT_URL!}/${TRACE_CONST.QR_CODE_BASE_URL}/${traceabilityId}.png`;
      QRCode.toFile(fullPath, targetUrl, {
        width: 300,
        margin: 1,
      }).catch((err) => {
        console.error(`Error generating QR PNG background for ${traceabilityId}:`, err);
      });
    }

    const response = new TraceabilityFormResDto();
    response.uniqueId = uniqueId;
    response.formKey = form.formKey;
    response.formName = form.formName;
    response.formDescription = form.formDescription || null;
    response.qrUrl = qrUrl || undefined;
    response.traceabilityId = traceabilityId || undefined;
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
        const relativePath = `${getFileLocation(file.mimetype, file.fieldname, true)}/${file.filename}`;
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

    let batch: any = null;
    if (dto.traceabilityId) {
      batch = await this.repository.getBatchByTraceabilityId(dto.traceabilityId, userCode);
    }

    if (!batch) {
      batch = await this.repository.createBatch(userCode, userCode);
    }

    if (isExist) {
      const existingSubmission = await this.repository.getSubmissionByUniqueId(dto.uniqueId);
      if (existingSubmission) {
        const seq = existingSubmission.seq;
        await this.repository.updateSubmission(seq, formDataStr, userCode);
        await this.repository.bindFilesToSubmission(seq, dto.uniqueId, userCode);

        if (dto.formSeq === 8) {
          await this.repository.completeBatch(batch.seq, userCode);
        }

        return 1;
      }
    }

    const traceabilityCode = await this.repository.generateTraceabilityCode();
    const insertId = await this.repository.insertSubmission(batch.seq, traceabilityCode, dto.formSeq, userCode, formDataStr, dto.uniqueId, userCode);

    if (insertId) {
      await this.repository.bindFilesToSubmission(insertId, dto.uniqueId, userCode);
    }

    if (dto.formSeq === 8) {
      await this.repository.completeBatch(batch.seq, userCode);
    }

    return 1;
  }

  async getSubmissionBatchList(dto: GetSubmissionBatchListDto, userCode: string): Promise<TraceabilityBatchListResDto> {
    const page = Math.max(1, dto.page || 1);
    const limit = Math.max(1, dto.limit || 10);
    const { list, total } = await this.repository.getSubmissionBatchList(userCode, dto);

    const mappedList: TraceabilityBatchItemResDto[] = list.map((item) => {
      const status = item.status || TraceabilityStatusEnum.PROCESSING;
      return {
        seq: item.seq,
        traceabilityId: item.traceabilityId,
        userCode: item.userCode,
        status,
        statusLabel: TRACE_CONST.STATUS[status as keyof typeof TRACE_CONST.STATUS]?.text || '',
        qrUrl: item.qrUrl || undefined,
        hasForm8: (item.form8Count || 0) > 0,
        submissionCount: Number(item.submissionCount || 0),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt || undefined,
      };
    });

    const totalPage = Math.ceil(total / limit);

    return {
      list: mappedList,
      total,
      page,
      limit,
      totalPage,
    };
  }

  async getFilesNotUse(): Promise<{ seq: number; filename: string }[]> {
    return await this.repository.getFilesNotUse();
  }

  async deleteFileCron(seq: number): Promise<number> {
    return await this.repository.deleteFileCron(seq);
  }
}
