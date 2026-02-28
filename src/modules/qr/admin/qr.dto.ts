import { IsNotEmpty, IsString } from 'class-validator';

export class RefuseRequestDto {
  @IsString()
  @IsNotEmpty()
  userCode: string;
}


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
