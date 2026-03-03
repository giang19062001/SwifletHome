import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { RequestQrcodeFilesResDto, RequestQrCodeResDto } from '../app/qr.response';

export class GetInfoRequestQrCodeAdminResDto extends OmitType(RequestQrCodeResDto, ['uniqueId'] as const) {
  @ApiProperty({ example: '' })
  @IsString()
  userCode: string;

  @ApiProperty({ example: '' })
  @IsString()
  transactionHash: string;

  @ApiProperty({
    type: () => RequestQrcodeFilesResDto,
    isArray: true,
  })
  requestQrcodeFiles: RequestQrcodeFilesResDto[];

  @ApiProperty({ example: '' })
  @IsString()
  qrCodeUrl: string;
}
