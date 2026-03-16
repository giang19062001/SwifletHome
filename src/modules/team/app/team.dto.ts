import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { PagingDto } from 'src/dto/admin.dto';
import { YnEnum } from 'src/interfaces/admin.interface';
import { IUserTeamTypeEnum } from '../../user/app/user.interface';

export class GetAllTeamDto extends PagingDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsOptional()
  provinceCode: string;

  @ApiProperty({
    example: IUserTeamTypeEnum.FACTORY,
    enum: IUserTeamTypeEnum,
  })
  @IsEnum(IUserTeamTypeEnum)
  @IsNotEmpty()
  userTypeKeyWord: IUserTeamTypeEnum;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsOptional()
  txtSearch: string;
}

export class GetReviewListOfTeamDto extends PagingDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  teamCode: string;
}

export class UploadReviewFilesDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    description: 'Luôn được generate phía app (uuid)',
  })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  teamCode: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Tối đa 5 file (ảnh)',
  })
  reviewImg: any[];
}

export class ReviewTeamDto {
  @ApiProperty({
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  star: number;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  review: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  teamCode: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;
}

export class TeamReviewFileStrResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    filename: string;
}

export class TeamReviewFileResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: 0 })
    reviewSeq: number;
    @ApiProperty({ example: '' })
    teamCode: string;
    @ApiProperty({ example: '' })
    homeName: string;
    @ApiProperty({ example: '' })
    filename: string;
    @ApiProperty({ example: '' })
    originalname: string;
    @ApiProperty({ example: 0 })
    size: number;
    @ApiProperty({ example: '' })
    mimetype: string;
    @ApiProperty({ example: '' })
    uniqueId: string;
    @ApiProperty({ example: YnEnum.N })
    isActive: YnEnum;
}
