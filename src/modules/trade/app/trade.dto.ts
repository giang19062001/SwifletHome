import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { TradeInteractTypeEnum, TradeListTypeEnum } from '../trade.enum';

export class CreateTradeDto {
  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Tên người bán' })
  @IsString()
  @IsNotEmpty()
  sellerName!: string;

  @ApiProperty({ example: '0901234567', description: 'Số điện thoại người bán' })
  @IsString()
  @IsNotEmpty()
  sellerPhone!: string;

  @ApiProperty({ example: '35000', description: 'Đơn giá theo gram (number string)' })
  @IsString()
  @IsNotEmpty()
  price!: string;

  @ApiProperty({ example: 100, description: 'Khối lượng cần bán (gram)' })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  mass!: number;

  @ApiProperty({ example: 12, description: 'Số lượng tổ yến' })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  nestQuantity!: number;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'UUID liên kết với file ảnh upload' })
  @IsUUID()
  @IsNotEmpty()
  uniqueId!: string;
}

export class UploadTradeImageDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'UUID liên kết với thông tin đăng bán' })
  @IsUUID()
  @IsNotEmpty()
  uniqueId!: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Ảnh tổ yến cần bán (1 ảnh duy nhất)',
  })
  tradeNestFile!: any;
}

export class GetTradeListDto {
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

  @ApiPropertyOptional({ example: TradeListTypeEnum.ALL, enum: TradeListTypeEnum, default: TradeListTypeEnum.ALL })
  @IsEnum(TradeListTypeEnum)
  @IsOptional()
  type?: TradeListTypeEnum = TradeListTypeEnum.ALL;
}

export class TradeInteractDto {
  @ApiPropertyOptional({ example: TradeInteractTypeEnum.SAVED, enum: [TradeInteractTypeEnum.SAVED], default: TradeInteractTypeEnum.SAVED, description: 'Loại tương tác: SAVED' })
  @IsEnum([TradeInteractTypeEnum.SAVED])
  @IsOptional()
  type?: TradeInteractTypeEnum = TradeInteractTypeEnum.SAVED;
}
