import { ApiProperty } from '@nestjs/swagger';
export class GetPhoneCodeAppResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  countryName: string;

  @ApiProperty({ example: '' })
  countryCode: string;

  @ApiProperty({ example: '' })
  isoCode: string;
}
export class PhoneCodeAppResDto {
  @ApiProperty({ example: 0 })
  seq: number;
  @ApiProperty({ example: 0 })
  countryName: number;
  @ApiProperty({ example: '' })
  countryCode: string;
  @ApiProperty({ example: '' })
  isoCode: string;
  @ApiProperty({ example: '' })
  languageCode: string;
}
