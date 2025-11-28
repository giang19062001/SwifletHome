import { ApiProperty, OmitType } from "@nestjs/swagger";
import { YnEnum } from "src/interfaces/admin.interface";

export class UserHomeImageResDto {
  @ApiProperty({ example: '' })
  filename: string;
}

export class GetHomeUserResDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  userHomeCode: string;

  @ApiProperty({ example: '' })
  userHomeName: string;

  @ApiProperty({ example: '' })
  userHomeAddress: string;

  @ApiProperty({ example: '' })
  userHomeProvince: string;

  @ApiProperty({ example: '' })
  userHomeDescription: string;

  @ApiProperty({ example: '' })
  userHomeImage: string;

  @ApiProperty({ example: YnEnum.N })
  isIntegateTempHum: YnEnum;

  @ApiProperty({ example: YnEnum.N })
  isIntegateCurrent: YnEnum;

  @ApiProperty({ example: YnEnum.N })
  isTriggered: YnEnum;

  @ApiProperty({ example: YnEnum.N })
  isMain: YnEnum;

  @ApiProperty({ example: '' })
  uniqueId: string;
}
export class GetHomesUserResDto extends OmitType(
  GetHomeUserResDto,
  ['uniqueId'] as const,
) {}