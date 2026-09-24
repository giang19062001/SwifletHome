import { ApiProperty } from '@nestjs/swagger';

export class TraceabilityFormSimpleResDto {
  @ApiProperty({ example: 1 })
  seq!: number;

  @ApiProperty({ example: 'BRIEF_SWIFT_HOUSE' })
  formKey!: string;

  @ApiProperty({ example: 'Nhật ký thu hoạch' })
  formName!: string;

  @ApiProperty({ example: 'Mô tả ngắn gọn về biểu mẫu', required: false })
  formDescription?: string;
}

export class TraceabilityFileItemResDto {
  @ApiProperty({ example: 1 })
  seq!: number;

  @ApiProperty({ example: 'uploads/images/traces/trace-xxx.jpg' })
  url!: string;

  @ApiProperty({ example: 'giay_CN.jpg' })
  originalname!: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimetype!: string;

  @ApiProperty({ example: 204800 })
  size!: number;
}

export class TraceabilityFieldResDto {
  @ApiProperty({ example: 'subjectType' })
  fieldKey!: string;

  @ApiProperty({ example: 'Loại đối tượng' })
  fieldName!: string;

  @ApiProperty({ example: 'text' })
  fieldType!: string;

  @ApiProperty({ example: 'Y' })
  isRequired!: string;

  @ApiProperty({ example: { minDate: '2024-01-01' }, required: false })
  config?: any;

  @ApiProperty({ description: 'Giá trị hiện tại của field, có thể là string/number/array/object/null', required: false })
  currentValue?: any;
}

export class TraceabilityGroupResDto {
  @ApiProperty({ example: 'OWNER_INFO' })
  groupKey!: string;

  @ApiProperty({ example: 'Thông tin cơ bản' })
  groupName!: string;

  @ApiProperty({ example: 'N', required: false, description: 'Y: cho phép lặp nhiều công đoạn/dòng, N: form đơn' })
  isLoop?: string;

  @ApiProperty({ example: [], required: false, description: 'Danh sách giá trị các lần lặp nếu isLoop = Y' })
  loopValues?: any[];

  @ApiProperty({ type: [TraceabilityFieldResDto] })
  fields!: TraceabilityFieldResDto[];
}

export class TraceabilityExtraLinkedDataDto {
  @ApiProperty({ example: 'Nhà yến An Gia', required: false })
  facilityName?: string;

  @ApiProperty({ example: '123 Đường ABC, Xã XYZ', required: false })
  facilityAddress?: string;

  @ApiProperty({ example: '2023-01-01', required: false })
  facilityActiveTime?: string;

  @ApiProperty({ example: '150 m2', required: false })
  facilityArea?: string;

  @ApiProperty({ example: 3, required: false })
  facilityFloor?: number | string;

  @ApiProperty({ example: 120, required: false })
  hmNumberNests?: number | string;
}

export class TraceabilityExtraLinkedInfoDto {
  @ApiProperty({ example: true, description: 'true nếu match với lô nội bộ, false nếu tự nhập' })
  isLinkedInternal!: boolean;

  @ApiProperty({ example: true, description: 'true nếu các trường bị disable (lấy từ nội bộ), false nếu cho phép nhập' })
  disabled!: boolean;

  @ApiProperty({ type: TraceabilityExtraLinkedDataDto, required: false })
  data?: TraceabilityExtraLinkedDataDto | null;
}

export class TraceabilityFormResDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', format: 'uuid' })
  uniqueId!: string;

  @ApiProperty({ example: 'TRC000001', required: false })
  traceabilityCode?: string;

  @ApiProperty({ example: 'BRIEF_SWIFT_HOUSE' })
  formKey!: string;

  @ApiProperty({ example: 'Nhật ký thu hoạch' })
  formName!: string;

  @ApiProperty({ example: 'Mô tả ngắn gọn về biểu mẫu', required: false })
  formDescription?: string;

  @ApiProperty({ example: 'uploads/images/traceQrcodes/3FAM-NY-92-HOM000001.png', required: false })
  qrUrl?: string;

  @ApiProperty({ example: '3FAM-NY-92-HOM000001', required: false })
  traceabilityId?: string;

  @ApiProperty({ example: 'LOT001', required: false, description: 'Mã lô của đợt truy xuất' })
  lotcode?: string;

  @ApiProperty({ example: 'PROCESSING', enum: ['PROCESSING', 'APPROVED', 'REFUSED'] })
  status!: string;

  @ApiProperty({ example: 'Đang xử lý' })
  statusLabel!: string;

  @ApiProperty({ type: [TraceabilityGroupResDto] })
  groups!: TraceabilityGroupResDto[];

  @ApiProperty({ required: false, description: 'Thông tin cơ sở & thu hoạch liên kết (áp dụng cho external)' })
  extraLinkedInfo?: TraceabilityExtraLinkedInfoDto;
}

export class CheckLotcodeMatchInternalResDto {
  @ApiProperty({ example: true })
  isMatched!: boolean;

  @ApiProperty({ type: TraceabilityExtraLinkedDataDto, required: false })
  data?: TraceabilityExtraLinkedDataDto | null;
}

export class UploadTraceabilityFileResDto {
  @ApiProperty({ example: 15 })
  seq!: number;

  @ApiProperty({ example: 'uploads/images/traces/trace-xxx.jpg' })
  url!: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimetype!: string;
}

export class TraceabilityHouseInfoResDto {
  @ApiProperty({ example: 'USR000001' })
  userCode!: string;

  @ApiProperty({ example: 'HOM000001' })
  userHomeCode!: string;

  @ApiProperty({ example: 'Nhà yến Cần Giờ 1' })
  userHomeName!: string;

  @ApiProperty({ example: 'Số 12 Đường số 5, Cần Giờ, TP.HCM' })
  userHomeAddress!: string;

  @ApiProperty({ example: 'uploads/images/traceQrcodes/3FAM-NY-92-HOM000001.png' })
  qrUrl!: string;

  @ApiProperty({ example: '3FAM-NY-92-HOM000001' })
  traceabilityId!: string;

  @ApiProperty({ example: 'PROCESSING', enum: ['PROCESSING', 'APPROVED', 'REFUSED'] })
  status!: string;

  @ApiProperty({ example: 'Đang xử lý' })
  statusLabel!: string;

  @ApiProperty({ example: 'N', enum: ['Y', 'N'] })
  isMain!: string;
}

export class TraceabilityBatchItemResDto {
  @ApiProperty({ example: 1 })
  seq!: number;

  @ApiProperty({ example: '3FAM-NY-USR000071-HOM000058-1' })
  traceabilityId!: string;

  @ApiProperty({ example: 'USR000071' })
  userCode!: string;

  @ApiProperty({ example: 'HOM000058', required: false })
  userHomeCode?: string;

  @ApiProperty({ example: 'PROCESSING', enum: ['PROCESSING', 'APPROVED', 'REFUSED'] })
  status!: string;

  @ApiProperty({ example: 'Đang xử lý' })
  statusLabel!: string;

  @ApiProperty({ example: 'uploads/images/traceQrcodes/3FAM-NY-USR000071-HOM000058-1.png', required: false })
  qrUrl?: string;

  @ApiProperty({ example: '2,3,4', required: false })
  harvestPhases?: string;

  @ApiProperty({ example: true, description: 'True nếu đợt đã hoàn thành FormSeq = 8' })
  hasFinalForm!: boolean;

  @ApiProperty({ example: 3, description: 'Số lượng form đã submit trong đợt này' })
  submissionCount!: number;

  @ApiProperty({ example: '2026-09-17T21:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-17T21:00:00.000Z', required: false })
  updatedAt?: Date;
}

export class TraceabilityBatchListResDto {
  @ApiProperty({ type: [TraceabilityBatchItemResDto] })
  list!: TraceabilityBatchItemResDto[];

  @ApiProperty({ example: 25 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 3 })
  totalPage!: number;
}
