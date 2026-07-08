import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { YnEnum } from 'src/interfaces/admin.interface';

export class UserTypeResDto {
  @ApiProperty({ example: '' })
  userTypeCode: string;

  @ApiProperty({ example: '' })
  userTypeKeyWord: string;

  @ApiProperty({ example: '' })
  userTypeName: string;
}

export class AllowUserTypeResDto {
  @ApiProperty({ example: '' })
  userTypeCode: string;

  @ApiProperty({ example: '' })
  userTypeKeyWord: string;

  @ApiProperty({ example: '' })
  userTypeName: string;

  @ApiProperty({ example: null })
  teamCode: string | null;

  @ApiProperty({ example: 'N' })
  isSetted: YnEnum;
}

export class UserPackageAppResDto {
  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  packageCode: string | null;

  @ApiProperty({ example: '' })
  packageName: string;

  @ApiProperty({ example: '' })
  packageDescription: string;
  @ApiProperty({ example: 0 })
  packageRemainDay: number;
  @ApiProperty({ example: '' })
  startDate: string | null;

  @ApiProperty({ example: '' })
  endDate: string | null;
}

export class UserTypeAppResDto {
  @ApiProperty({ example: '' })
  userTypeCode: string;

  @ApiProperty({ example: '' })
  userTypeKeyWord: string;

  @ApiProperty({ example: '' })
  userTypeName: string;
}

export class UserAppResDto {
  @ApiProperty({ example: 0 })
  homesTotal: number;

  @ApiProperty({ example: '' })
  userCode!: string;

  @ApiProperty({ example: '' })
  userName!: string;

  @ApiProperty({ example: '' })
  userPhone!: string;

  @ApiProperty({ example: '' })
  countryCode!: string;

  @ApiProperty({ example: '' })
  userPassword!: string;

  @ApiProperty({ example: '' })
  deviceToken!: string;

  @ApiProperty({ example: '' })
  packageCode!: string;

  @ApiProperty({ example: '' })
  packageName!: string;

  @ApiProperty({ example: '' })
  packageDescription!: string;

  @ApiProperty({ example: 0 })
  packageRemainDay!: number;

  @ApiProperty({ example: '' })
  startDate!: string | null;

  @ApiProperty({ example: '' })
  endDate!: string | null;

  @ApiProperty({ example: '' })
  paymentMethod!: string;

  @ApiProperty({ example: 0 })
  seq?: number;

  @ApiProperty({ example: '' })
  userTypeCode?: string;
  
  @ApiProperty({ example: '' })
  userTypeKeyWord?: string;
}

export class GetInfoUserAppResDto extends IntersectionType(UserAppResDto, UserTypeResDto, UserPackageAppResDto) {
}

export class LoginResDto extends UserAppResDto {
  @ApiProperty({ example: '' })
  accessToken: string;
}

export class ChangeTypeTokenAppResDto extends LoginResDto {
  @ApiProperty({ example: 'Y' })
  isSetted: string;
}
