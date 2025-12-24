import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';
import { PagingDto } from 'src/dto/admin.dto';

export enum UserTypeEnum {
  APP = 'APP',
  ADMIN = 'ADMIN',
}

export enum UserPackageFilterEnum {
  FREE = 'FREE',
  PAY = 'PAY',
  ALL = 'ALL',
}

export class GetAllUserDto extends PagingDto {
  @ApiProperty({ example: 'APP', enum: UserTypeEnum })
  @IsEnum(UserTypeEnum)
  @IsNotEmpty()
  type: UserTypeEnum;

  @ApiProperty({
    example: '',
  })
  @IsOptional()
  userName: string;

  @ApiProperty({
    example: '',
  })
  @IsOptional()
  userPhone: string;

  @ApiProperty({ example: 'ALL', enum: UserPackageFilterEnum })
  @IsEnum(UserPackageFilterEnum)
  @IsOptional()
  userPackageFilter?: UserPackageFilterEnum;
}

export class GetDetailDto {
  @ApiProperty({ example: 'APP', enum: UserTypeEnum })
  @IsEnum(UserTypeEnum)
  @IsNotEmpty()
  type: string;
}

export class UpdateUserPackageAdminDto {
  @ApiProperty({
    example: null,
    required: false,
    nullable: true,
  })
  @ValidateIf((_, value) => value !== null) // bỏ qua validate khi value string === null
  @IsString()
  packageCode: string | null;
}
