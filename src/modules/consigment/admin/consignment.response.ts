import { ApiProperty } from '@nestjs/swagger';
import { DeliveringAddressResDto } from '../app/consignment.response';

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

  @ApiProperty({ example: 0 })
  nestQuantity: number;

  @ApiProperty({ example: '' })
  deliveryAddress: string;

  @ApiProperty({ example: '' })
  receiverName: string;

  @ApiProperty({ example: '' })
  receiverPhone: string;

  @ApiProperty({ example: '' })
  consignmentStatus: string;

  @ApiProperty({ example: new Date() })
  createdAt: Date;

  @ApiProperty({
    type: DeliveringAddressResDto,
    isArray: true,
  })
  deliveringAddressList?: DeliveringAddressResDto[];
}
