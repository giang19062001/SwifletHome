import { ApiProperty } from '@nestjs/swagger';

export class ResUserAppDto {
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

  @ApiProperty({ example: 'Y', enum: ['Y', 'N'] })
  isActive: 'Y' | 'N';
}

export class ResUserAuthAppDto extends ResUserAppDto {
  @ApiProperty({ example: '' })
  accessToken: string;
}

export class ResUserAppInfoDto extends ResUserAppDto {

  @ApiProperty({ example: '' })
  startDate: Date | null;

  @ApiProperty({ example: '' })
  endDate: Date | null;

    @ApiProperty({ example: '' })
  packageCode: Date | null;

  @ApiProperty({ example: '' })
  packageName: string;

  @ApiProperty({ example: '' })
  packageDescription: string;
}
