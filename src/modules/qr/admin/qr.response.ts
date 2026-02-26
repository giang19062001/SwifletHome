import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { RequestQrCodeResDto } from '../app/qr.response';

export class GetInfoRequestQrCodeAdminResDto extends OmitType(RequestQrCodeResDto, ['uniqueId'] as const) {
  @ApiProperty({ example: '' })
  @IsString()
  userCode: string;

  @ApiProperty({ example: '' })
  @IsString()
  transactionHash: string;

  @ApiProperty({ example: '' })
  @IsString()
  processingPackingVideoUrl: string;

  @ApiProperty({ example: '' })
  @IsString()
  qrCodeUrl: string;
}
