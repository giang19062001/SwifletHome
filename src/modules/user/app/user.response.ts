import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { YnEnum } from 'src/interfaces/admin.interface';

export class UserAppResDto {
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
}

class UserPackageAppResDto {
  @ApiProperty({ example: '' })
  packageCode: Date | null;

  @ApiProperty({ example: '' })
  packageName: string;

  @ApiProperty({ example: '' })
  packageDescription: string;

  @ApiProperty({ example: 0 })
  packageRemainDay: number;

  @ApiProperty({ example: '' })
  startDate: Date | null;

  @ApiProperty({ example: '' })
  endDate: Date | null;
}

export class GetInfoUserAppResDto extends IntersectionType(UserAppResDto, UserPackageAppResDto) {
  @ApiProperty({ example: 0 })
  totalHomes: number;
}

export class LoginResDto extends UserAppResDto {
  @ApiProperty({ example: '' })
  accessToken: string;
}
