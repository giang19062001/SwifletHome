import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export enum ReportTypeEnum {
  SUMMARY = 'SUMMARY',
  DETAIL = 'DETAIL',
}
export class GetHarvertReportDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userHomeCode: string;

  @ApiProperty({
    example: 2026,
  })
  @IsNumber()
  @IsNotEmpty()
  harvestYear: number;

  @ApiProperty({
    example: ReportTypeEnum.SUMMARY,
    enum: ReportTypeEnum,
  })
  @IsEnum(ReportTypeEnum)
  @IsNotEmpty()
  reportType: ReportTypeEnum;
}
