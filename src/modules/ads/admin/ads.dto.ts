import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateAdsBannerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  uuid: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  position?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  targetScreen: string;

  @ApiProperty()
  @IsEnum(['LINK', 'FUNCTION'])
  @IsOptional()
  actionType?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  actionValue: string;
}

export class UpdateAdsBannerDto extends CreateAdsBannerDto {}

export class AdsFileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  uuid: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  adsBanner: any;
}
