import { IsNotEmpty, IsString } from 'class-validator';
import { RequestQrCodeFromDbDto } from '../qr.dto';
import { OmitType } from '@nestjs/swagger';

export class WriteQrBlockchainDto {
  @IsString()
  @IsNotEmpty()
  requestCode: string;

  @IsString()
  @IsNotEmpty()
  userCode: string;

  @IsString()
  @IsNotEmpty()
  userHomeCode: string;

  @IsString()
  @IsNotEmpty()
  qrCodeUrl: string;

  @IsString()
  @IsNotEmpty()
  transactionHash: string;

  @IsString()
  @IsNotEmpty()
  blockNumber: string;

  @IsString()
  @IsNotEmpty()
  transactionFee: string;
}

export class GetAllInfoRequestQrCodeAdminResDto extends OmitType(RequestQrCodeFromDbDto, ['uniqueId'] as const) {
  @IsString()
  @IsNotEmpty()
  userCode: string;

  @IsString()
  @IsNotEmpty()
  transactionHash: string;

  @IsString()
  @IsNotEmpty()
  processingPackingVideoUrl: string;

  @IsString()
  @IsNotEmpty()
  qrCodeUrl: string;
}
