import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PagingDto } from 'src/dto/admin.dto';
import { YnEnum } from 'src/interfaces/admin.interface';

export class GetHomesAdminDto extends PagingDto {
  @ApiProperty({
    example: '',
  })
  @IsOptional()
  userName: string;

  @ApiProperty({
    example: '',
  })
  @IsOptional()
  userPhone: string;

  @ApiProperty({
    example: '',
  })
  @IsOptional()
  provinceCode: string;
}

export class TriggerUserHomeSensorDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userCode: string;

  // @ApiProperty({
  //   example: '',
  // })
  // @IsString()
  // @IsNotEmpty()
  // userHomeCode: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  macId: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  wifiId: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  wifiPassword: string;
}

export class UserHomeSensorResDto {
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
    isActive: YnEnum;
    @ApiProperty({ example: new Date() })
    createdAt: Date;
    @ApiProperty({ example: new Date() })
    updatedAt: Date;
    @ApiProperty({ example: '' })
    createdId: string;
    @ApiProperty({ example: '' })
    updatedId: string;
    @ApiProperty({ example: '' })
    macId: string;
    @ApiProperty({ example: '' })
    wifiId: string;
    @ApiProperty({ example: '' })
    wifiPassword: string;
}
