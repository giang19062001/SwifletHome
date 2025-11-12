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
    example: 'token_efg123',
  })
  @IsString()
  @IsNotEmpty()
  userDevice: string;
}

export class LoginAppDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message:'Số điện thoại phải là số'})
  userPhone: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userPassword: string;

  @ApiProperty({
    example: 'token_efg123',
  })
  @IsString()
  @IsNotEmpty()
  userDevice: string;
}

export class RegisterAppDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message:'Số điện thoại phải là số'})
  userPhone: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userPassword: string;

  @ApiProperty({
    example: 'token_abc123',
  })
  @IsString()
  @IsNotEmpty()
  userDevice: string;
}
