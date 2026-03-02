import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsEnum, IsOptional } from 'class-validator';
import { Msg } from 'src/helpers/message.helper';
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
