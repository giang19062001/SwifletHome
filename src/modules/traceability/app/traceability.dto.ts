import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { YnEnum } from 'src/interfaces/admin.interface';

export class GetSubmissionBatchListDto {
  @ApiPropertyOptional({ example: 10, default: 10 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 'N', description: 'N = Nội bộ, Y = External (VCĐP)' })
  @IsString()
  @IsOptional()
  isExternal?: YnEnum;
}

export class GetAllFormsDto {
  @ApiPropertyOptional({ example: 'N', description: 'N = Nội bộ (Cho chủ nhà yến), Y = External (Cho tác nhân vận chuyển, sơ chế, đóng gói,..)' })
  @IsString()
  @IsOptional()
  isExternal?: YnEnum;
}

export class GetFormDto {
  @ApiProperty({ example: 'BRIEF_SWIFT_HOUSE', description: 'formKey' })
  @IsString()
  @IsNotEmpty()
  formKey!: string;

  @ApiPropertyOptional({ example: 'HOM000001', description: 'Nhà yến chính hiện tại của người dùng (Optional cho External)' })
  @IsString()
  @IsOptional()
  userHomeCode?: string;

  @ApiPropertyOptional({ example: 'N', description: 'N = Nội bộ (Cho chủ nhà yến), Y = External (Cho tác nhân vận chuyển, sơ chế, đóng gói,..)' })
  @IsString()
  @IsOptional()
  isExternal?: YnEnum;

  @ApiPropertyOptional({ example: 'TRACE_HOM000001_00001', description: 'Mã đợt truy xuất' })
  @IsString()
  @IsOptional()
  traceabilityId: string = '';
}

export class UploadTraceabilityFilesDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  uniqueId!: string;

  @ApiProperty({ example: 'subjectType', description: 'Thông tin cơ bản' })
  @IsString()
  @IsNotEmpty()
  fieldKey!: string;

  @ApiProperty({ example: 'file_multiple', enum: ['file_single', 'file_multiple'] })
  @IsEnum(['file_single', 'file_multiple'])
  @IsNotEmpty()
  fieldType!: 'file_single' | 'file_multiple';

  @ApiPropertyOptional({ example: 'N', description: 'N = Nội bộ (Cho chủ nhà yến), Y = External (Cho tác nhân vận chuyển, sơ chế, đóng gói,..)' })
  @IsString()
  @IsOptional()
  isExternal?: YnEnum;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Tối đa 5 file (ảnh, video, docs)',
  })
  traceabilityFiles!: any[];
}

export class DeleteFileQueryDto {
  @ApiPropertyOptional({ example: 'N', description: 'N = Nội bộ (Cho chủ nhà yến), Y = External (Cho tác nhân vận chuyển, sơ chế, đóng gói,..)' })
  @IsString()
  @IsOptional()
  isExternal?: YnEnum;
}

export class SubmitTraceabilityDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  uniqueId!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  formSeq!: number;

  @ApiPropertyOptional({ example: '3FAM-NY-USR000071-HOM000058-1', description: 'Mã đợt truy xuất nguồn gốc duy nhất' })
  @IsString()
  @IsOptional()
  traceabilityId?: string;

  @ApiPropertyOptional({ example: 'HOM000001', description: 'Nhà yến chính hiện tại của người dùng (Optional cho External)' })
  @IsString()
  @IsOptional()
  userHomeCode?: string; // Không có -> external

  @ApiPropertyOptional({ example: 'N', description: 'N = Nội bộ (Cho chủ nhà yến), Y = External (Cho tác nhân vận chuyển, sơ chế, đóng gói,...)' })
  @IsString()
  @IsOptional()
  isExternal?: YnEnum; // 'Y' -> external

  @ApiProperty({ example: { OWNER_INFO: { subjectType: 'Cá nhân', businessRegistrationFile: 2 } } })
  @IsObject()
  @IsNotEmpty()
  formData: any;
}
