import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { RowDataPacket } from 'mysql2';
import * as path from 'path';
import * as QRCode from 'qrcode';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { getFileLocation } from 'src/config/multer.config';
import { Msg } from 'src/helpers/message.helper';
import { YnEnum } from 'src/interfaces/admin.interface';
import { v4 as uuidv4 } from 'uuid';
import { TRACE_CONST } from '../common/traceability.const';
import { TraceabilityStatusEnum } from '../common/traceability.enum';
import { TraceabilityExternalRepository } from './traceability-external.repository';
import { TraceabilityFieldsService } from './traceability-fields.service';
import { GetFormDto, GetSubmissionBatchListDto, SubmitTraceabilityDto, UploadTraceabilityFilesDto } from './traceability.dto';
import {
  CheckLotcodeMatchInternalResDto,
  TraceabilityBatchItemResDto,
  TraceabilityBatchListResDto,
  TraceabilityExtraLinkedInfoDto,
  TraceabilityFormResDto,
  TraceabilityGroupResDto,
  UploadTraceabilityFileResDto,
} from './traceability.response';

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

    let batchLotcode = submission?.lotcode || null;
    let batchSeq = submission?.batchSeq || null;
    if (traceabilityId && (!batchLotcode || !batchSeq)) {
      const batch = await this.repository.getBatchByTraceabilityId(traceabilityId, userCode);
      if (batch) {
        if (!batchLotcode && batch.lotcode) {
          batchLotcode = batch.lotcode;
        }
        if (!batchSeq && batch.seq) {
          batchSeq = batch.seq;
        }
      }
    }

    // Map fields to groups
    const mappedGroups: TraceabilityGroupResDto[] = await this.traceabilityFieldsService.mapGroupsAndFields(
      groups,
      fields,
      savedData,
      files,
      traceabilityCode,
      traceabilityId,
      YnEnum.Y,
      userCode,
      undefined,
      batchLotcode,
    );

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
    response.lotcode = batchLotcode || '';
    if (traceabilityCode) {
      response.traceabilityCode = traceabilityCode;
    }

    // Xử lý extraLinkedInfo
    let extraLinkedInfo: TraceabilityExtraLinkedInfoDto = {
      isLinkedInternal: false,
      data: null,
    };

    if (batchSeq) {
      const extraLinked = await this.repository.getExtraLinkedByBatchExternalSeq(batchSeq);
      if (extraLinked) {
        let parsedData: any = null;
        if (extraLinked.formDataExtra) {
          try {
            parsedData = typeof extraLinked.formDataExtra === 'string' ? JSON.parse(extraLinked.formDataExtra) : extraLinked.formDataExtra;
          } catch (e) {
            parsedData = null;
          }
        }
        extraLinkedInfo = {
          isLinkedInternal: Boolean(extraLinked.batchInternalSeq),
          data: parsedData,
        };
      }
    }
    response.extraLinkedInfo = extraLinkedInfo;

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
    const incomingLotcode = dto.externalInfo?.lotcode !== undefined ? String(dto.externalInfo.lotcode).trim() : null;

    let batch: any = null;
    if (dto.traceabilityId) {
      batch = await this.repository.getBatchByTraceabilityId(dto.traceabilityId, userCode);
    }

    // Kiểm tra trùng lotcode trước khi thực sự lưu data
    if (incomingLotcode && incomingLotcode.length > 0) {
      const isDuplicate = await this.repository.checkDuplicateLotcode(incomingLotcode, batch?.seq || null);
      if (isDuplicate) {
        throw new BadRequestException({ message: Msg.Lotcode, data: null });
      }
    }

    // Kiểm tra lô nội bộ đã bị dành lô (đang liên kết với lô ngoại khác) chưa
    let internalBatch: any = null;
    if (incomingLotcode && incomingLotcode.length > 0) {
      internalBatch = await this.repository.getInternalBatchByLotcode(incomingLotcode);
      if (internalBatch) {
        const isAlreadyLinked = await this.repository.checkInternalBatchAlreadyLinked(internalBatch.seq, batch?.seq || null);
        if (isAlreadyLinked) {
          throw new BadRequestException({ message: Msg.LotcodeUsed, data: null });
        }
      }
    }

    if (dto.traceabilityId && batch) {
      if (incomingLotcode !== null && batch.lotcode !== incomingLotcode) {
        await this.repository.updateBatchLotcode(batch.seq, incomingLotcode, userCode);
        batch.lotcode = incomingLotcode;
      }
    }

    if (!batch) {
      batch = await this.repository.createBatch(userCode, userCode, incomingLotcode || undefined);
    }

    // Xử lý extra linked
    const batchInternalSeq = internalBatch ? internalBatch.seq : null;
    const formDataExtraStr = dto.externalInfo?.formDataExtra ? JSON.stringify(dto.externalInfo.formDataExtra) : null;

    await this.repository.saveExtraLinked(userCode, batch.seq, incomingLotcode, batchInternalSeq, formDataExtraStr, userCode);

    if (isExist) {
      const existingSubmission = await this.repository.getSubmissionByUniqueId(dto.uniqueId);
      if (existingSubmission) {
        const seq = existingSubmission.seq;
        await this.repository.updateSubmission(seq, formDataStr, userCode);
        await this.repository.bindFilesToSubmission(seq, dto.uniqueId, userCode);

        // Hiện tại không cần xử lý cột status cho table này
        // if (dto.formSeq === FINAL_FORM_SEQ) {
        //   await this.repository.completeBatch(batch.seq, userCode);
        // }

        return 1;
      }
    }

    const traceabilityCode = await this.repository.generateTraceabilityCode();
    const insertId = await this.repository.insertSubmission(batch.seq, traceabilityCode, dto.formSeq, userCode, formDataStr, dto.uniqueId, userCode);

    if (insertId) {
      await this.repository.bindFilesToSubmission(insertId, dto.uniqueId, userCode);
    }

    // Hiện tại không cần xử lý cột status cho table này
    // if (dto.formSeq === FINAL_FORM_SEQ) {
    //   await this.repository.completeBatch(batch.seq, userCode);
    // }

    return 1;
  }

  async getSubmissionBatchList(dto: GetSubmissionBatchListDto, userCode: string): Promise<TraceabilityBatchListResDto> {
    const page = Math.max(1, dto.page || 1);
    const limit = Math.max(1, dto.limit || 10);
    const { list, total } = await this.repository.getSubmissionBatchList(userCode, { ...dto, page, limit });

    const mappedList: TraceabilityBatchItemResDto[] = list.map((item) => {
      const status = item.status || TraceabilityStatusEnum.PROCESSING;
      return {
        seq: item.seq,
        traceabilityId: item.traceabilityId,
        userCode: item.userCode,
        status,
        statusLabel: TRACE_CONST.STATUS[status as keyof typeof TRACE_CONST.STATUS]?.text || '',
        qrUrl: item.qrUrl || undefined,
        hasFinalForm: (item.formFinalCount || 0) > 0,
        submissionCount: Number(item.submissionCount || 0),
        lotcode: item.lotcode || '--',
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

  async checkLotcodeMatchInternal(lotcode: string, traceabilityId?: string, userCode?: string): Promise<CheckLotcodeMatchInternalResDto> {
    if (!lotcode || !lotcode.trim()) {
      return { isMatched: false, data: null };
    }

    const cleanLotcode = lotcode.trim();

    let excludeBatchExternalSeq: number | null = null;
    if (traceabilityId) {
      const currentBatch = await this.repository.getBatchByTraceabilityId(traceabilityId, userCode);
      if (currentBatch) {
        excludeBatchExternalSeq = currentBatch.seq;
      }
    }

    // Kiểm tra nếu mã lô đã bị trùng trong bảng external
    const isDuplicateExt = await this.repository.checkDuplicateLotcode(cleanLotcode, excludeBatchExternalSeq);
    if (isDuplicateExt) {
      throw new BadRequestException({ message: Msg.Lotcode, data: null });
    }

    const internalBatch = await this.repository.getInternalBatchByLotcode(cleanLotcode);
    if (!internalBatch) {
      return { isMatched: false, data: null };
    }

    // Kiểm tra lô nội bộ này có đang liên kết với lô ngoại khác không
    const isAlreadyLinked = await this.repository.checkInternalBatchAlreadyLinked(internalBatch.seq, excludeBatchExternalSeq);
    if (isAlreadyLinked) {
      throw new BadRequestException({ message: Msg.LotcodeUsed, data: null });
    }

    const submissions = await this.repository.getInternalSubmissionsForExtra(internalBatch.seq);
    const data = this.traceabilityFieldsService.extractExtraFieldsFromInternalSubmissions(submissions);

    return {
      isMatched: true,
      data,
    };
  }
}
