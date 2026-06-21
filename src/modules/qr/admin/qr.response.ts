import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { RequestQrcodeFilesResDto, RequestQrCodeResDto } from '../app/qr.response';
import { YnEnum } from 'src/interfaces/admin.interface';

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

  @ApiProperty({
    example: YnEnum.N,
    enum: YnEnum,
  })
  @IsEnum(YnEnum)
  isSold: YnEnum;
}
