import { ApiProperty } from '@nestjs/swagger';
import { TradeStatusEnum } from '../trade.enum';

export class UploadTradeImageResDto {
  @ApiProperty({ example: 1 })
  seq!: number;

  @ApiProperty({ example: 'uploads/images/tradeNests/tradeNestFile-123.jpg' })
  filename!: string;
}

export class TradeItemResDto {
  @ApiProperty({ example: 1 })
  seq!: number;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  sellerName!: string;

  @ApiProperty({ example: '0901234567' })
  sellerPhone!: string;

  @ApiProperty({ example: '35000' })
  price!: string;

  @ApiProperty({ example: 100 })
  mass!: number;

  @ApiProperty({ example: 12 })
  nestQuantity!: number;

  @ApiProperty({ example: TradeStatusEnum.SELLING, enum: TradeStatusEnum })
  status!: string;

  @ApiProperty({ example: 'uploads/images/tradeNests/tradeNestFile-123.jpg' })
  tradeNestImage!: string;

  @ApiProperty({ example: false, description: 'True nếu record là do chính user gọi API đăng bán, false nếu của người khác' })
  isMine!: boolean;

  @ApiProperty({ example: false, description: 'True nếu user đã lưu (SAVED) đơn đăng bán này' })
  isSaved!: boolean;

  @ApiProperty({ example: '2026-10-05T20:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-05T20:00:00.000Z', required: false, nullable: true })
  updatedAt?: Date | null;
}

export class TradeListResDto {
  @ApiProperty({ type: [TradeItemResDto] })
  list!: TradeItemResDto[];

  @ApiProperty({ example: 10 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 1 })
  totalPage!: number;
}
