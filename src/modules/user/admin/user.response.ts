import { ApiProperty } from '@nestjs/swagger';

export class UserTypeResDto {
  @ApiProperty({ example: '' })
  userTypeCode: string;

  @ApiProperty({ example: '' })
  userTypeKeyWord: string;

  @ApiProperty({ example: '' })
  userTypeName: string;
}

export class UserForTeamByTypeResDto {
  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  userName: string;

  @ApiProperty({ example: '' })
  userPhone: string;
}
