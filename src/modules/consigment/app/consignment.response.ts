import { ApiProperty } from '@nestjs/swagger';
import { ConsignmentStatusEnum } from './consigment.interface';

export class DeliveringAddressResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  address: string;

  @ApiProperty({ example: '' })
  createdAt: Date;
}

export class ConsignmentHistoryResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: ConsignmentStatusEnum.WAITING })
  consignmentStatus: ConsignmentStatusEnum;

  @ApiProperty({ example: null })
  address: string | null;

  @ApiProperty({ example: '' })
  createdAt: Date;
}

export class GetAllConsignmentResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  consignmentCode: string;

  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  senderName: string;

  @ApiProperty({ example: '' })
  senderPhone: string;

  @ApiProperty({ example: '' })
  nestTypeCode: string;

  @ApiProperty({ example: '' })
  nestTypeLabel: string;

  @ApiProperty({ example: 0 })
  nestQuantity: number;

  @ApiProperty({ example: '' })
  deliveryAddress: string;

  @ApiProperty({ example: '' })
  receiverName: string;

  @ApiProperty({ example: '' })
  receiverPhone: string;

  @ApiProperty({ example: ConsignmentStatusEnum.WAITING })
  consignmentStatus: ConsignmentStatusEnum;

  @ApiProperty({
    type: DeliveringAddressResDto,
    isArray: true,
  })
  deliveringAddressList: DeliveringAddressResDto[];

  @ApiProperty({ example: new Date() })
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  updatedAt: Date;
}



export class GetDetailConsignmentResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  consignmentCode: string;

  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  senderName: string;

  @ApiProperty({ example: '' })
  senderPhone: string;

  @ApiProperty({ example: '' })
  nestTypeCode: string;

  @ApiProperty({ example: '' })
  nestTypeLabel: string;

  @ApiProperty({ example: 0 })
  nestQuantity: number;

  @ApiProperty({ example: '' })
  deliveryAddress: string;

  @ApiProperty({ example: '' })
  receiverName: string;

  @ApiProperty({ example: '' })
  receiverPhone: string;

  @ApiProperty({ example: ConsignmentStatusEnum.WAITING })
  consignmentStatus: ConsignmentStatusEnum;

  @ApiProperty({
    type: ConsignmentHistoryResDto,
    isArray: true,
  })
  consignmentHistories: ConsignmentHistoryResDto[];

  @ApiProperty({ example: new Date() })
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  updatedAt: Date;
}
