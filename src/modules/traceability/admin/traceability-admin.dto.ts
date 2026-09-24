import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PagingDto } from 'src/dto/admin.dto';
import { TraceabilityStatusEnum } from '../common/traceability.enum';

export class GetTraceabilityListAdminDto extends PagingDto {
  @ApiProperty({ example: 'TRC000001', required: false, description: 'Từ khóa tìm kiếm theo mã truy xuất, mã ID, tên/SĐT khách hàng, tên nhà yến' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiProperty({ example: 1, required: false, description: 'Seq của form biểu mẫu' })
  @IsNumber()
  @IsOptional()
  formSeq?: number;

  @ApiProperty({ example: 'PROCESSING', enum: ['PROCESSING', 'APPROVED', 'REFUSED'], required: false, description: 'Trạng thái đơn' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: '2026-01-01', required: false, description: 'Từ ngày (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  fromDate?: string;

  @ApiProperty({ example: '2026-12-31', required: false, description: 'Đến ngày (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  toDate?: string;
}

export class UpdateTraceabilityStatusAdminDto {
  @ApiProperty({ example: 'APPROVED', enum: Object.values(TraceabilityStatusEnum) })
  @IsEnum(TraceabilityStatusEnum)
  @IsNotEmpty()
  status!: TraceabilityStatusEnum;
}
