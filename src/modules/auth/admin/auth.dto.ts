import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { YnEnum } from "src/interfaces/admin.interface";

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

export class TokenUserAdminResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    userId: string;
    @ApiProperty({ example: '' })
    userPassword: string;
    @ApiProperty({ example: '' })
    userName: string;
    @ApiProperty({ example: YnEnum.N })
    isActive: YnEnum;
    @ApiProperty({ example: '' })
    userCode!: string;
    @ApiProperty({ example: 0 })
    iat!: number;
    @ApiProperty({ example: 0 })
    exp!: number;
}

export class GeneratePasswordDto {
  @ApiProperty({
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}
