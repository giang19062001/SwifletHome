import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { PagingDto } from 'src/dto/admin.dto';
import { YnEnum } from 'src/interfaces/admin.interface';
import { IUserTeamTypeEnum } from '../../user/app/user.interface';
import { MsgDto } from 'src/helpers/message.helper';

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
    example: 'uuid chính lấy từ getInitFormCreateTeam',
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
  @IsNotEmpty({ message: MsgDto.CannotNull('review') })
  review: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  teamCode: string;

  @ApiProperty({
    example: 'uuid chính lấy từ getInitFormCreateTeam',
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

// ─── Team Registration DTOs (App) ───────────────────────────────────────────
export class CreateTeamAppDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  teamName: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  teamPhone: string;

  @ApiProperty({ example: ['79', '82'] })
  @IsNotEmpty()
  provinceCodes: any;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  teamAddress: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  teamDescription: string;

  @ApiProperty({
    example: { monthlyVolumn: 1000, minimunQuantity: 10 },
    description: 'Thông tin đặc thù của xưởng gia công (Sản lượng tháng, Số lượng tối thiểu) - giá trị này sẽ là null của đội kỹ thuật',
  })
  @IsOptional()
  teamDescriptionSpecial: any | null;

  @ApiProperty({
    example: [{ serviceTypeCode: 'BUILD_RAW', serviceDescription: 'nội dung', uniqueId: 'uuid của service này' }],
    description: 'Mảng dịch vụ đăng ký',
  })
  @Type(() => Array<{
    serviceTypeCode: string;
    serviceDescription: string;
    uniqueId: string;
  }>)
  @IsOptional()
  servicesData: any;

  @ApiProperty({ example: 'uuid chính lấy từ getInitFormCreateTeam', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;
}

export class UploadTeamMainImageAppDto {
  @ApiProperty({ example: 'uuid chính lấy từ getInitFormCreateTeam', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Ảnh chính của team' })
  teamImage: any;
}

export class UploadTeamFilesAppDto {
  @ApiProperty({ example: 'uuid chính lấy từ getInitFormCreateTeam', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;

  @ApiProperty({ example: 'FILE_FAC_LEGAL' })
  @IsOptional()
  @IsString()
  fileTypeCode?: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Tối đa 5 file (ảnh/video phụ)',
  })
  teamFiles: any[];
}

export class UploadServiceFilesAppDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Tối đa 5 file (ảnh/video dịch vụ)',
  })
  teamServiceFiles: any[];
}

export class DeleteFileAppDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  seq: number;

  @ApiProperty({ example: 'teamFiles' })
  @IsString()
  @IsNotEmpty()
  uploadType: 'teamFiles' | 'teamServiceFiles' | 'teamImage';
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
