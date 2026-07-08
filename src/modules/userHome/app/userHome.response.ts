import { ApiProperty, OmitType } from '@nestjs/swagger';
import { YnEnum } from 'src/interfaces/admin.interface';

export class UserHomeImageResDto {
  @ApiProperty({ example: 0 })
  seq: number;

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

  @ApiProperty({ example: 0 })
  userHomeLength: number;

  @ApiProperty({ example: 0 })
  userHomeWidth: number;

  @ApiProperty({ example: 0 })
  userHomeFloor: number;

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
export class GetHomesUserResDto extends OmitType(GetHomeUserResDto, ['uniqueId'] as const) {}

export class UserHomeAreaResDto {
    @ApiProperty({ example: 0 })
    seq: number;

    @ApiProperty({ example: '' })
    userHomeCode: string;

    @ApiProperty({ example: '' })
    userCode: string;

    @ApiProperty({ example: 0 })
    userHomeLength: number;

    @ApiProperty({ example: 0 })
    userHomeWidth: number;

    @ApiProperty({ example: 0 })
    userHomeFloor: number;
}

export class UserHomeResDto {
    @ApiProperty({ example: 0 })
    seq: number;

    @ApiProperty({ example: '' })
    userHomeCode: string;

    @ApiProperty({ example: '' })
    userCode: string;

    @ApiProperty({ example: '' })
    userName!: string;

    @ApiProperty({ example: '' })
    userPhone!: string;

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

    @ApiProperty({ example: 0 })
    userHomeLength: number;

    @ApiProperty({ example: 0 })
    userHomeWidth: number;

    @ApiProperty({ example: 0 })
    userHomeFloor: number;
    
    @ApiProperty({ example: '' })
    uniqueId: string;

    @ApiProperty({ example: YnEnum.N })
    isIntegateTempHum: YnEnum;

    @ApiProperty({ example: YnEnum.N })
    isIntegateCurrent: YnEnum;

    @ApiProperty({ example: YnEnum.N })
    isTriggered: YnEnum;

    @ApiProperty({ example: YnEnum.N })
    isMain: YnEnum;

    @ApiProperty({ example: YnEnum.N })
    isActive: YnEnum;

    @ApiProperty({ example: new Date() })
    createdAt: Date;

    @ApiProperty({ example: new Date() })
    updatedAt: Date;

    @ApiProperty({ example: '' })
    createdId: string;

    @ApiProperty({ example: '' })
    updatedId: string;
}

export class UserHomeImageStrResDto {
    @ApiProperty({ example: 0 })
    seq: number;

    @ApiProperty({ example: '' })
    filename: string;
}

export class UserHomeImageFileResDto {
    @ApiProperty({ example: 0 })
    seq: number;

    @ApiProperty({ example: 0 })
    userHomeSeq: number;

    @ApiProperty({ example: '' })
    userCode: string;

    @ApiProperty({ example: '' })
    uniqueId: string;

    @ApiProperty({ example: '' })
    filename: string;

    @ApiProperty({ example: '' })
    originalname: string;

    @ApiProperty({ example: 0 })
    size: number;

    @ApiProperty({ example: '' })
    mimetype: string;
    
    @ApiProperty({ example: YnEnum.N })
    isActive: YnEnum;
}
