import { ApiProperty, OmitType } from '@nestjs/swagger';

export class GetDetailTeamResDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  userTypeCode: string;

  @ApiProperty({ example: '' })
  teamCode: string;

  @ApiProperty({ example: '' })
  teamName: string;

  @ApiProperty({ example: '' })
  teamAddres: string;

  @ApiProperty({ example: '' })
  teamDescription: string;

  @ApiProperty({
    type: Object,
    nullable: true,
    example: {
      floor: 'ABC',
      root: 'ABC',
      light: 'ABC',
      nest: 'ABC',
    },
  })
  teamDescriptionSpecial: Record<string, any> | null;

  @ApiProperty({ example: '0' })
  provinceCode: string;
}

export class GetAllTeamResDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  userTypeCode: string;

  @ApiProperty({ example: '' })
  userTypeKeyWord: string;

  @ApiProperty({ example: '' })
  userTypeName: string;

  @ApiProperty({ example: '' })
  teamCode: string;

  @ApiProperty({ example: '' })
  teamName: string;

  @ApiProperty({ example: '' })
  teamAddres: string;

  @ApiProperty({ example: '' })
  teamDescription: string;

  @ApiProperty({ example: '0' })
  provinceCode: string;
}
