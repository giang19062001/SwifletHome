import { BadRequestException, Injectable } from '@nestjs/common';
import { RowDataPacket } from 'mysql2';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { getFileLocation } from 'src/config/multer.config';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';
import { GetFormDto, GetSubmissionBatchListDto, SubmitTraceabilityDto, UploadTraceabilityFilesDto } from './traceability.dto';
import { TraceabilityAppRepository } from './traceability.repository';
import {
  TraceabilityFormResDto,
  TraceabilityGroupResDto,
  UploadTraceabilityFileResDto,
  TraceabilityHouseInfoResDto,
  TraceabilityBatchItemResDto,
  TraceabilityBatchListResDto,
} from './traceability.response';
import { generateTraceabilityId, generateTraceabilityQr } from './traceability.func';
import { TraceabilityStatusEnum } from '../common/traceability.enum';
import { TRACE_CONST } from '../common/traceability.const';
import { Msg } from 'src/helpers/message.helper';
import { TraceabilityFieldsService } from './traceability-fields.service';
import { TraceabilityExternalService } from './traceability-external.service';
import { YnEnum } from 'src/interfaces/admin.interface';

@Injectable()
export class TraceabilityAppService {
  constructor(
    private readonly repository: TraceabilityAppRepository,
    private readonly fileLocalService: FileLocalService,
    private readonly traceabilityFieldsService: TraceabilityFieldsService,
    private readonly externalService: TraceabilityExternalService,
  ) {}

  async getAllForms(isExternal?: string): Promise<{ seq: number; formKey: string; formName: string; formDescription: string | null }[]> {
    const rows = await this.repository.getAllForms(isExternal);
    return rows.map((r) => ({
      seq: r.seq,
      formKey: r.formKey,
      formName: r.formName,
      formDescription: r.formDescription || '',
    }));
  }

  async getForm(dto: GetFormDto, userCode: string): Promise<TraceabilityFormResDto> {
    // gọi sang truy vấn external - s
    if (dto.isExternal === YnEnum.Y || (!dto.userHomeCode && !dto.traceabilityId)) {
      return await this.externalService.getForm(dto, userCode);
    } // gọi sang truy vấn external - e
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
    let status = TraceabilityStatusEnum.PROCESSING;
    let userHomeCode = dto?.userHomeCode || '';
    let submission: RowDataPacket | null = null;
    // TODO: Luôn có traceabilityId
    const batch = await this.repository.getBatchByTraceabilityId(dto.traceabilityId, userCode);
    if (batch) {
      traceabilityId = batch.traceabilityId;
      qrUrl = batch.qrUrl;
      status = batch.status || TraceabilityStatusEnum.PROCESSING;
      if (batch.userHomeCode) {
        userHomeCode = batch.userHomeCode;
      }
    }
    submission = await this.repository.getSubmissionByTraceabilityIdAndFormSeq(dto.traceabilityId, form.seq, userCode);
    if (submission) {
      uniqueId = submission.uniqueId;
      traceabilityCode = submission.traceabilityCode;
      files = await this.repository.getFilesByUniqueId(uniqueId);
      try {
        savedData = typeof submission.formData === 'string' ? JSON.parse(submission.formData) : submission.formData;
      } catch (e) {
        savedData = null;
      }
    } else {
      savedData = null;
    }

    // Map fields to groups
    const mappedGroups: TraceabilityGroupResDto[] = await this.traceabilityFieldsService.mapGroupsAndFields(
      groups,
      fields,
      savedData,
      files,
      traceabilityCode,
      traceabilityId,
      dto.isExternal || YnEnum.N,
      userCode,
      userHomeCode,
    );

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
    // gọi sang truy vấn external - s
    if (dto.isExternal === YnEnum.Y) {
      return await this.externalService.uploadFiles(dto, files, createdId);
    } // gọi sang truy vấn external - e
    if (dto.fieldType === 'file_single') {
      await this.repository.deactivateFilesForFieldSingle(dto.uniqueId, dto.fieldKey);
    }

    const result = await Promise.all(
      files.map(async (file) => {
        const relativePath = `${getFileLocation(file.mimetype, file.fieldname, false)}/${file.filename}`;
        const seq = await this.repository.insertFile(dto.uniqueId, dto.fieldKey, dto.fieldType, relativePath, file.originalname, file.size, file.mimetype, createdId);
        return { seq, url: relativePath, mimetype: file.mimetype };
      }),
    );

    return result;
  }

  async deleteFile(seq: number, userCode: string, isExternal?: string): Promise<number> {
    // gọi sang truy vấn external - s
    if (isExternal === YnEnum.Y) {
      return await this.externalService.deleteFile(seq, userCode);
    } // gọi sang truy vấn external - e
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
    // gọi sang truy vấn external - s
    if (dto.isExternal === YnEnum.Y || !dto.userHomeCode) {
      return await this.externalService.submit(dto, userCode);
    } // gọi sang truy vấn external - e
    const isExist = await this.repository.checkExistUniqueId(dto.uniqueId);

    const formDataStr = JSON.stringify(dto.formData);
    const phases = this.traceabilityFieldsService.extractHiNumberHarvest(dto.formData);
    const harvestPhases = phases.length > 0 ? phases.sort((a, b) => a - b).join(',') : null;

    const homeSeq = await this.repository.getUserHomeSeq(dto.userHomeCode);
    if (!homeSeq) {
      throw new BadRequestException({ message: Msg.HomeNotFound, data: null });
    }

    let batch: any = null;
    if (dto.traceabilityId) {
      batch = await this.repository.getBatchByTraceabilityId(dto.traceabilityId, userCode);
      if (batch && harvestPhases && batch.harvestPhases !== harvestPhases) {
        await this.repository.updateBatchHarvestPhases(batch.seq, harvestPhases, userCode);
        batch.harvestPhases = harvestPhases;
      }
    }

    if (!batch) {
      batch = await this.repository.findOrCreateBatch(userCode, dto.userHomeCode, userCode, harvestPhases);
    }

    if (isExist) {
      // Cập nhật form
      const existingSubmission = await this.repository.getSubmissionByUniqueId(dto.uniqueId);
      if (existingSubmission) {
        const seq = existingSubmission.seq;
        const batchSeq = existingSubmission.batchSeq || batch.seq;

        await this.repository.updateSubmission(seq, formDataStr, userCode, harvestPhases, batchSeq);
        await this.repository.bindFilesToSubmission(seq, dto.uniqueId, userCode);

        return 1;
      }
    }

    // Tạo mới form
    const traceabilityCode = await this.repository.generateTraceabilityCode();

    const insertId = await this.repository.insertSubmission(batch.seq, traceabilityCode, dto.formSeq, userCode, dto.userHomeCode, formDataStr, dto.uniqueId, userCode);

    if (insertId) {
      await this.repository.bindFilesToSubmission(insertId, dto.uniqueId, userCode);
    }

    return 1;
  }

  async getTraceInfoEachHouse(currentUserCode: string): Promise<TraceabilityHouseInfoResDto[]> {
    const houses = await this.repository.getUserHouses(currentUserCode);

    const results = await Promise.all(
      houses.map(async (house) => {
        const houseUserCode = house.userCode;
        const userHomeCode = house.userHomeCode;

        let status = TraceabilityStatusEnum.PROCESSING;
        let qrUrl: string | null = null;
        let traceabilityId: string | null = null;

        const processingBatch = await this.repository.getProcessingBatchByUserHome(houseUserCode, userHomeCode);
        if (processingBatch) {
          traceabilityId = processingBatch.traceabilityId;
          qrUrl = processingBatch.qrUrl;
          status = processingBatch.status || TraceabilityStatusEnum.PROCESSING;
        } else {
          const nextIndex = await this.repository.getNextBatchIndex(houseUserCode, userHomeCode);
          traceabilityId = generateTraceabilityId(houseUserCode, userHomeCode, nextIndex);
          qrUrl = generateTraceabilityQr(houseUserCode, userHomeCode, nextIndex);
          status = TraceabilityStatusEnum.PROCESSING;
        }

        // Kiểm tra QR code PNG file đã tồn tại trên ổ đĩa chưa, nếu chưa thì tạo ở background (không await để tránh blocking API response)
        const dirPath = path.join(process.cwd(), 'public', TRACE_CONST.QR_CODE_PATH);
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

        return {
          userCode: houseUserCode,
          userHomeCode,
          userHomeName: house.userHomeName,
          userHomeAddress: house.userHomeAddress,
          qrUrl: qrUrl || '',
          traceabilityId: traceabilityId || '',
          status,
          statusLabel: TRACE_CONST.STATUS[status]?.text || '',
          isMain: house.isMain || 'N',
        };
      }),
    );

    return results;
  }

  async getSubmissionBatchList(dto: GetSubmissionBatchListDto, userCode: string): Promise<TraceabilityBatchListResDto> {
    // gọi sang truy vấn external - s
    if (dto.isExternal === YnEnum.Y) {
      return await this.externalService.getSubmissionBatchList(dto, userCode);
    } // gọi sang truy vấn external - e

    const page = Math.max(1, dto.page || 1);
    const limit = Math.max(1, dto.limit || 10);
    const { list, total } = await this.repository.getSubmissionBatchList(userCode, dto);

    const mappedList: TraceabilityBatchItemResDto[] = list.map((item) => {
      const status = item.status || TraceabilityStatusEnum.PROCESSING;
      return {
        seq: item.seq,
        traceabilityId: item.traceabilityId,
        userCode: item.userCode,
        userHomeCode: item.userHomeCode || undefined,
        status,
        statusLabel: TRACE_CONST.STATUS[status as keyof typeof TRACE_CONST.STATUS]?.text || '',
        qrUrl: item.qrUrl || undefined,
        harvestPhases: item.harvestPhases || undefined,
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
    return await this.repository.deleteFileBySeq(seq);
  }
}
