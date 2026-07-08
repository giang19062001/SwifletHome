import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  teamUserName: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsOptional()
  teamPhone: string;

  @ApiProperty({
    example: ['79', '82'],
  })
  @IsNotEmpty()
  provinceCodes: any;

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
    example: '[]',
  })
  @IsString()
  @IsOptional()
  servicesData: string;

  @ApiProperty({
    example: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  uniqueId: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  teamImage: any;

  @ApiProperty({
    example: YnEnum.N,
    enum: YnEnum,
  })
  @IsEnum(YnEnum)
  @IsOptional()
  isSeleted?: YnEnum;
}

export class UploadTeamMainImageDto {
  @ApiProperty({ example: 'unique-id' })
  @IsString()
  @IsNotEmpty()
  uniqueId: string;
}

export class UploadTeamFilesDto {
  @ApiProperty({ example: 'unique-id' })
  @IsString()
  @IsNotEmpty()
  uniqueId: string;

  @ApiProperty({ example: 'FILE_FAC_LEGAL' })
  @IsOptional()
  @IsString()
  fileTypeCode?: string;
}

export class UploadServiceFilesDto {
  @ApiProperty({ example: 'unique-id' })
  @IsString()
  @IsNotEmpty()
  uniqueId: string;
}

export class DeleteFileDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  seq: number;

  @ApiProperty({ example: 'teamFiles' })
  @IsString()
  @IsNotEmpty()
  uploadType: 'teamFiles' | 'teamServiceFiles' | 'teamImage';
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
