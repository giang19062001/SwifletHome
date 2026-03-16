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

export class TeamResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    userCode: string;
    @ApiProperty({ example: '' })
    userName!: string;
    @ApiProperty({ example: '' })
    userTypeCode: string;
    @ApiProperty({ example: '' })
    teamCode: string;
    @ApiProperty({ example: '' })
    teamName: string;
    @ApiProperty({ example: '' })
    teamAddress: string;
    @ApiProperty({ example: '' })
    teamDescription: string;
    @ApiProperty({ example: '' })
    teamDescriptionSpecial: Record<string, any> | null;
    @ApiProperty({ example: '' })
    provinceCode: string;
    @ApiProperty({ example: '' })
    provinceName!: string;
    @ApiProperty({ example: YnEnum.N })
    isActive: YnEnum;
    @ApiProperty({ example: new Date() })
    createdAt: Date;
    @ApiProperty({ example: new Date() })
    updatedAt: Date;
    @ApiProperty({ example: '' })
    createdId: string;
    @ApiProperty({ example: '' })
    updatedId: string;
    @ApiProperty({ example: '' })
    teamImage: string | TeamImgResDto;
    @ApiProperty({ example: '' })
    teamImages: TeamImgResDto[];
    @ApiProperty({ example: '' })
    userTypeKeyWord: string;
    @ApiProperty({ example: '' })
    userTypeName: string;
}

export class TeamReviewResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    review: string;
    @ApiProperty({ example: 0 })
    star: number;
    @ApiProperty({ example: '' })
    reviewBy: string;
    @ApiProperty({ example: '' })
    reviewByName!: string;
    @ApiProperty({ example: '' })
    teamName: string;
    @ApiProperty({ example: '' })
    ownerName!: string;
    @ApiProperty({ example: new Date() })
    createdAt: Date;
    @ApiProperty({ example: new Date() })
    updatedAt: Date;
    @ApiProperty({ example: YnEnum.N })
    isDisplay: YnEnum;
    @ApiProperty({ example: '' })
    reviewImages: TeamReviewFileResDto[];
}

export class TeamReviewFileResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: 0 })
    reviewSeq: number;
    @ApiProperty({ example: '' })
    filename: string;
    @ApiProperty({ example: '' })
    originalname: string;
    @ApiProperty({ example: 0 })
    size: number;
    @ApiProperty({ example: '' })
    mimetype: string;
    @ApiProperty({ example: YnEnum.N })
    isActive: YnEnum;
}

export class TeamImgResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: 0 })
    teamSeq: number;
    @ApiProperty({ example: '' })
    filename: string;
    @ApiProperty({ example: '' })
    originalname: string;
    @ApiProperty({ example: 0 })
    size: number;
    @ApiProperty({ example: '' })
    mimetype: string;
    @ApiProperty({ example: YnEnum.N })
    isActive: YnEnum;
}
