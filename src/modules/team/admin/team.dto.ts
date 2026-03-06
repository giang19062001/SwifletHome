import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { YnEnum } from 'src/interfaces/admin.interface';

export class CreateTeamDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userCode: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userTypeCode: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  teamName: string;

  @ApiProperty({
    example: '0',
  })
  @IsString()
  @IsNotEmpty()
  provinceCode: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  teamAddress: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  teamDescription: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsOptional()
  teamDescriptionSpecial: any | null;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  teamImage: any;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  teamImages: any[];
}

export class UpdateTeamDto extends CreateTeamDto {}


export class ChangDisplayReviewDto {
  @ApiProperty({
    example: YnEnum.Y,
    enum: YnEnum,
  })
  @IsEnum(YnEnum)
  @IsNotEmpty()
  isDisplay: YnEnum;
}