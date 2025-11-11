import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

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
