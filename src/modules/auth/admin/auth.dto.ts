import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginAdminDto {
  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: 'asdf',
  })
  @IsString()
  @IsNotEmpty()
  userPassword: string;
}

export class GeneratePasswordDto {
  @ApiProperty({
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}
