import { ApiProperty } from "@nestjs/swagger";

export class ResInfoBankDto {
  @ApiProperty()
  qrcode: string;

  @ApiProperty()
  bankName: string;

  @ApiProperty()
  bankBranch: string;

  @ApiProperty()
  accountName: string;

  @ApiProperty()
  accountNumber: string;

  @ApiProperty()
  paymentContent: string;
}