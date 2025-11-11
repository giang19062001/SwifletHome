import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginAppDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
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
