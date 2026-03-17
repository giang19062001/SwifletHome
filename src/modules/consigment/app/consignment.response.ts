import { ApiProperty } from '@nestjs/swagger';
import { ConsignmentStatusEnum } from './consigment.interface';

export class DeliveringAddressResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  address: string;

  @ApiProperty({ example: '' })
  createdAt: Date
}

export class ConsignmentResDto {
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
