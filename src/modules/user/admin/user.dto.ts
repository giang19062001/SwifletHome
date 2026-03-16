import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
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

export class GetUsersForTeamByTypeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userTypeCode: string;


  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pageType: "create" | "update"
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


export class GetDetailDto {
  @ApiProperty({ example: 'APP', enum: UserTypeEnum })
  @IsEnum(UserTypeEnum)
  @IsNotEmpty()
  type: string;
}

export class UserTypeResDto {
    @ApiProperty({ example: '' })
    userTypeCode: string;
    @ApiProperty({ example: '' })
    userTypeKeyWord: string;
    @ApiProperty({ example: '' })
    userTypeName: string;
}

export class UserForTeamByTypeResDto {
    @ApiProperty({ example: '' })
    userCode: string;
    @ApiProperty({ example: '' })
    userName: string;
    @ApiProperty({ example: '' })
    userPhone: string;
}
