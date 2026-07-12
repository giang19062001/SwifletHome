import { ApiProperty } from '@nestjs/swagger';
import { YnEnum } from 'src/interfaces/admin.interface';

export class TokenEaterAppResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  eaterCode: string;

  @ApiProperty({ example: '' })
  deviceToken: string;

  @ApiProperty({ example: '' })
  userTypeKeyWord: string;
}

export class TokenUserAppResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  userName: string;

  @ApiProperty({ example: '' })
  userPhone: string;

  @ApiProperty({ example: '' })
  deviceToken: string;

  @ApiProperty({ example: '' })
  userTypeCode: string;

  @ApiProperty({ example: '' })
  userTypeKeyWord: string;

  @ApiProperty({ example: '' })
  countryCode: string;

  @ApiProperty({ example: 'vi' })
  languageCode: string;

  @ApiProperty({ example: YnEnum.N })
  isActive: YnEnum;

  @ApiProperty({ example: 0, required: false })
  iat?: number;

  @ApiProperty({ example: 0, required: false })
  exp?: number;
}

export class TokenUserAppWithPasswordResDto {
  @ApiProperty({ example: '' })
  userPassword: string;

  @ApiProperty({ example: 0 })
  seq!: number;

  @ApiProperty({ example: '' })
  userCode!: string;

  @ApiProperty({ example: '' })
  userName!: string;

  @ApiProperty({ example: '' })
  userPhone!: string;

  @ApiProperty({ example: '' })
  deviceToken!: string;

  @ApiProperty({ example: '' })
  userTypeCode!: string;

  @ApiProperty({ example: '' })
  userTypeKeyWord!: string;

  @ApiProperty({ example: '' })
  countryCode!: string;

  @ApiProperty({ example: 'vi' })
  languageCode!: string;

  @ApiProperty({ example: YnEnum.N })
  isActive!: YnEnum;
}
