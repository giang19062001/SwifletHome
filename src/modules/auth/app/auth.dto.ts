import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';



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
    example: 'fIMHPAUfTYKpTPVcTvtux8:APA91bFQ52ugkIGF5wq04L3ALYNamDTcHvFQWAvP7mWLSi5d6DXXqKhDEadgOIorK7Zk-loIstEvo-HwydCzFaJannJfCkWrgc1zb86lu8Z6rf3qtZoTahk',
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
  @Matches(/^\d+$/, { message:'Số điện thoại phải là số'})
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

export class RegisterAppDto {
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
  @Matches(/^\d+$/, { message:'Số điện thoại phải là số'})
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
