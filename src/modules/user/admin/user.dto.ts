import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { PagingDto } from 'src/dto/admin.dto';

export enum UserTypeEnum {
  APP = 'APP',
  ADMIN = 'ADMIN',
}

export class GetAllUserDto extends PagingDto {
  @ApiProperty({ example: 'APP', enum: UserTypeEnum })
  @IsEnum(UserTypeEnum)
  @IsNotEmpty()
  type: UserTypeEnum;
}

export class GetDetailDto {
  @ApiProperty({ example: 'APP', enum: UserTypeEnum })
  @IsEnum(UserTypeEnum)
  @IsNotEmpty()
  type: string;
}
