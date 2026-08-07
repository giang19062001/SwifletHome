import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { RequestSellStatusEnum } from '../common/qr.enum';

export class GetQrCodeSellingAdminResDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  seq!: number;

  @ApiProperty({ example: '' })
  @IsString()
  requestCode!: string;

  @ApiProperty({ example: '' })
  @IsString()
  userCode!: string;

  @ApiProperty({ example: '' })
  @IsString()
  userName!: string;

  @ApiProperty({ example: '' })
  @IsString()
  userHomeCode!: string;

  @ApiProperty({ example: '' })
  @IsString()
  userHomeName!: string;

  @ApiProperty({ example: '' })
  @IsString()
  userPhone!: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  volumeForSell!: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  nestQuantity!: number;

  @ApiProperty({
    example: RequestSellStatusEnum.PROCESSING,
    enum: RequestSellStatusEnum,
  })
  @IsEnum(RequestSellStatusEnum)
  requestSellStatus!: RequestSellStatusEnum;

  @ApiProperty({ example: 0 })
  @IsNumber()
  priceForSelling!: number;

  @ApiProperty({ example: '2026-08-07T08:36:46.000Z' })
  createdAt!: Date;
}
