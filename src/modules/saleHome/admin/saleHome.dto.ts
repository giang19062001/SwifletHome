import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { HomeInfoDto, HostInfoDto, NestInfoDto, PolicyInfoDto, TourInfoDto } from '../app/saleHome.dto';

export class UploadFilesAdminDto {
  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;

  @ApiProperty({ example: 'FILE_OUTSIDE' })
  @IsOptional()
  @IsString()
  fileTypeCode?: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Tối đa 5 file (ảnh/video)',
  })
  saleHomeFiles: any[];
}

export class CreateSaleHomeAdminDto {
  @ApiProperty({ example: 'USER0001' })
  @IsString()
  @IsNotEmpty()
  userCode: string;

  @ApiProperty({ type: HostInfoDto })
  @ValidateNested()
  @Type(() => HostInfoDto)
  @IsObject()
  hostInfo: HostInfoDto;

  @ApiProperty({ type: HomeInfoDto })
  @ValidateNested()
  @Type(() => HomeInfoDto)
  @IsObject()
  homeInfo: HomeInfoDto;

  @ApiProperty({ type: NestInfoDto })
  @ValidateNested()
  @Type(() => NestInfoDto)
  @IsObject()
  nestInfo: NestInfoDto;

  @ApiProperty({ type: TourInfoDto })
  @ValidateNested()
  @Type(() => TourInfoDto)
  @IsObject()
  tourInfo: TourInfoDto;

  @ApiProperty({ type: PolicyInfoDto })
  @ValidateNested()
  @Type(() => PolicyInfoDto)
  @IsObject()
  policyInfo: PolicyInfoDto;

  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;
}

export class UpdateSaleHomeAdminDto extends CreateSaleHomeAdminDto {}

export class UpdateStatusSaleHomeDto {
  @ApiProperty({ example: 'APPROVED' })
  @IsString()
  @IsNotEmpty()
  status: string;
}
