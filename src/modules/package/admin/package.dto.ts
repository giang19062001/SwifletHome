import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PackageOptionTypeEnum } from '../package.interface';

export class UpdatePackageDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  packageName: string;

  @ApiProperty({
    example: "0",
  })
  @IsString()
  @IsOptional()
  packagePrice: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsOptional()
  packageItemSamePrice: string;

  @ApiProperty({
    example: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  packageExpireDay: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  packageDescription: string;

  @ApiProperty({
    example: PackageOptionTypeEnum.MONEY,
    enum: PackageOptionTypeEnum,
  })
  @IsEnum(PackageOptionTypeEnum)
  @IsNotEmpty()
  packageOptionType: PackageOptionTypeEnum;
}
