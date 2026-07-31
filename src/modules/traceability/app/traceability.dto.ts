import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class GetFormDto {
  @ApiProperty({ example: 'BRIEF_SWIFT_HOUSE', description: 'formKey' })
  @IsString()
  @IsNotEmpty()
  formKey!: string;

  @ApiProperty({ example: 'HOM000001', description: 'Nhà yến chính hiện tại của người dùng' })
  @IsString()
  @IsNotEmpty()
  userHomeCode!: string;
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

export class SubmitTraceabilityDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  uniqueId!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  formSeq!: number;

  @ApiProperty({ example: 'HOM000001' })
  @IsString()
  @IsNotEmpty()
  userHomeCode!: string;

  @ApiProperty({ example: { OWNER_INFO: { subjectType: 'Cá nhân', businessRegistrationFile: 2 } } })
  @IsObject()
  @IsNotEmpty()
  formData: any;
}
