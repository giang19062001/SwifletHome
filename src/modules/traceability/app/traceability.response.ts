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

  @ApiProperty({ type: [TraceabilityFieldResDto] })
  fields!: TraceabilityFieldResDto[];
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

  @ApiProperty({ example: 'PROCESSING', enum: ['PROCESSING', 'APPROVED', 'REFUSED'] })
  status!: string;

  @ApiProperty({ example: 'Đang xử lý' })
  statusLabel!: string;

  @ApiProperty({ type: [TraceabilityGroupResDto] })
  groups!: TraceabilityGroupResDto[];
}

export class UploadTraceabilityFileResDto {
  @ApiProperty({ example: 15 })
  seq!: number;

  @ApiProperty({ example: 'uploads/images/traces/trace-xxx.jpg' })
  url!: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimetype!: string;
}
