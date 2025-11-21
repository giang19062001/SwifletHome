import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString, ValidateIf } from 'class-validator';
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

export class UpdateUserPaymentAdminDto {
  @ApiProperty({
    example: null,
    required: false,
    nullable: true,
  })
  @ValidateIf((_, value) => value !== null) // bỏ qua validate khi value string === null
  @IsString()
  packageCode: string | null;

  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  updatedId: string;
}
