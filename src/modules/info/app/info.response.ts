import { ApiProperty } from '@nestjs/swagger';
import { YnEnum } from 'src/interfaces/admin.interface';

export class GetInfoResDto {
  @ApiProperty()
  seq: string;

  @ApiProperty()
  infoKeyword: string;

  @ApiProperty()
  infoName: string;

  @ApiProperty()
  infoContent: Record<string, any>;

  @ApiProperty()
  infoDescription: string;

  @ApiProperty()
  isActive: YnEnum;
}
export class InfoAppResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  infoKeyword: 'BANK';

  @ApiProperty({ example: '' })
  infoName: string;

  @ApiProperty({ example: '' })
  infoContent: any;

  @ApiProperty({ example: '' })
  infoDescription: string;

  @ApiProperty({ example: YnEnum.N })
  isActive: YnEnum;

  @ApiProperty({ example: new Date() })
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: '' })
  createdId!: string;

  @ApiProperty({ example: '' })
  updatedId!: string;
}
export class InfoBankAppResDto {
  @ApiProperty({ example: '' })
  qrcode: string;

  @ApiProperty({ example: '' })
  bankName: string;

  @ApiProperty({ example: '' })
  bankBranch: string;

  @ApiProperty({ example: '' })
  accountName: string;

  @ApiProperty({ example: '' })
  accountNumber: string;

  @ApiProperty({ example: '' })
  paymentContent: string;
}
