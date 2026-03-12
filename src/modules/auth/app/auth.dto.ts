import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsEnum, IsOptional } from 'class-validator';
import { YnEnum } from 'src/interfaces/admin.interface';

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

  
  @ApiProperty({
    example: '+84',
  })
  @IsString()
  @IsNotEmpty()
  countryCode: string;
}

export class UpdateDeviceTokenDto {
  @ApiProperty({
    example: 'ABCXYZ123',
  })
  @IsString()
  @IsNotEmpty()
  deviceToken: string;

    @ApiProperty({
    example: '+84',
  })
  @IsString()
  @IsNotEmpty()
  countryCode: string;
}

export class ChangeTypeTokenDto {
  @ApiProperty({
    example: 'UST000002',
  })
  @IsString()
  @IsNotEmpty()
  userTypeCode: string;
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
    example: 'ABCXYZ123',
  })
  @IsString()
  @IsNotEmpty()
  deviceToken: string;

  @ApiProperty({
    example: '+84',
  })
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty({
    example: YnEnum.N,
    enum: YnEnum,
    default: YnEnum.N,
  })
  @IsEnum(YnEnum)
  isSave: YnEnum = YnEnum.N; // mặc định N
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
    example: 'UST000001',
  })
  @IsString()
  @IsOptional()
  userTypeCode: string;

  @ApiProperty({
    example: '+84',
  })
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty({
    example: 'ABCXYZ123',
  })
  @IsString()
  @IsNotEmpty()
  deviceToken: string;
}

export class TokenUserAppResDto {
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
    @ApiProperty({ example: '' })
    userTypeCode: string;
    @ApiProperty({ example: '' })
    userTypeKeyWord: string;
    @ApiProperty({ example: '' })
    countryCode: string;
    @ApiProperty({ example: YnEnum.N })
    isActive: YnEnum;
    @ApiProperty({ example: 0, required: false })
    iat?: number;
    @ApiProperty({ example: 0, required: false })
    exp?: number;
}

export class TokenUserAppWithPasswordResDto {
    @ApiProperty({ example: '' })
    userPassword: string;
    @ApiProperty({ example: 0 })
    seq!: number;
    @ApiProperty({ example: '' })
    userCode!: string;
    @ApiProperty({ example: '' })
    userName!: string;
    @ApiProperty({ example: '' })
    userPhone!: string;
    @ApiProperty({ example: '' })
    deviceToken!: string;
    @ApiProperty({ example: '' })
    userTypeCode!: string;
    @ApiProperty({ example: '' })
    userTypeKeyWord!: string;
    @ApiProperty({ example: '' })
    countryCode!: string;
    @ApiProperty({ example: YnEnum.N })
    isActive!: YnEnum;
}
