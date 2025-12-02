import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { Msg } from 'src/helpers/message.helper';

export class UpdateUserDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userName: string;
}


export class UpdatePasswordDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class UpdateDeviceTokenDto {
  @ApiProperty({
    example: 'c5IcFc-dS9apRp4PbSgqoU:APA91bFyHwpnHANDbQUUzywUOTOIsT2xamQzjwI3J9SjpAh4H1HBaPad3e0kk2VFQ4hx1PegPmzizHOYl4FNnIOnGRLU2MxZBeSTIJOv_Vgk2C0oCEqd174',
  })
  @IsString()
  @IsNotEmpty()
  deviceToken: string;
}

export class LoginAppDto {
  @ApiProperty({
    example: '0334644324',
  })
  @IsString()
  @IsNotEmpty()
  userPhone: string;

  @ApiProperty({
    example: 'Giang19062001!',
  })
  @IsString()
  @IsNotEmpty()
  userPassword: string;

  @ApiProperty({
    example: 'c5IcFc-dS9apRp4PbSgqoU:APA91bFyHwpnHANDbQUUzywUOTOIsT2xamQzjwI3J9SjpAh4H1HBaPad3e0kk2VFQ4hx1PegPmzizHOYl4FNnIOnGRLU2MxZBeSTIJOv_Vgk2C0oCEqd174',
  })
  @IsString()
  @IsNotEmpty()
  deviceToken: string;
}

export class RegisterUserAppDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    example: '0334644324',
  })
  @IsString()
  @IsNotEmpty()
  userPhone: string;

  @ApiProperty({
    example: 'Giang19062001!',
  })
  @IsString()
  @IsNotEmpty()
  userPassword: string;

  @ApiProperty({
    example: 'fIMHPAUfTYKpTPVcTvtux8:APA91bFQ52ugkIGF5wq04L3ALYNamDTcHvFQWAvP7mWLSi5d6DXXqKhDEadgOIorK7Zk-loIstEvo-HwydCzFaJannJfCkWrgc1zb86lu8Z6rf3qtZoTahk',
  })
  @IsString()
  @IsNotEmpty()
  deviceToken: string;
}
