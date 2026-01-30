import { ApiProperty } from '@nestjs/swagger';

export class GetPhoneCodeResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  countryName: string;

  @ApiProperty({ example: '' })
  countryCode: string;

  @ApiProperty({ example: '' })
  isoCode: string;
}
