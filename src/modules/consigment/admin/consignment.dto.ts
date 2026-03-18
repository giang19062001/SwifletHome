import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ConsignmentStatusEnum } from '../app/consigment.interface';

export class DeliveringAddressDto {
  @ApiProperty({ example: 0 })
  @IsOptional()
  seq?: number;

  @ApiProperty({ example: 'Hà Nội' })
  @IsString()
  @IsNotEmpty()
  address: string;
}

export class UpdateConsignmentDto {
  @ApiProperty({ example: 'DELIVERING', enum: ConsignmentStatusEnum })
  @IsEnum(ConsignmentStatusEnum)
  consignmentStatus: ConsignmentStatusEnum;
  
  @ApiProperty({ example: 'Đang giao hàng tới trạm trung chuyển' })
  @IsString()
  @IsNotEmpty()
  noticeContent: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  userCode: string;

  @ApiProperty({ type: DeliveringAddressDto, isArray: true })
  @IsArray()
  @IsOptional()
  deliveringAddressList?: DeliveringAddressDto[];
}
