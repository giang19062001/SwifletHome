import { ApiProperty } from '@nestjs/swagger';

export class ReportOverviewResDto {
  @ApiProperty()
  totalUser: number;

  @ApiProperty()
  totalUserHome: number;

  @ApiProperty()
  totalSaleHomeApproved: number;

  @ApiProperty()
  totalSaleHomeWaiting: number;

  @ApiProperty()
  totalGuestConsulation: number;

  @ApiProperty()
  totalConsignment: number;

  @ApiProperty()
  totalUserSeries: number[];

  @ApiProperty()
  totalUserHomeSeries: number[];

  @ApiProperty()
  totalGuestConsulationSeries: number[];

  @ApiProperty()
  totalConsignmentSeries: number[];

  @ApiProperty()
  mediaUserHomeSeries: number[];

  @ApiProperty()
  mediaSaleHomeApprovedSeries: number[];

  @ApiProperty()
  mediaSaleHomeWaitingSeries: number[];

  @ApiProperty()
  radialUserSeries: number[];

  @ApiProperty()
  totalDoctor: number;

  @ApiProperty()
  totalDoctorSeries: number[];

  @ApiProperty()
  totalSightseeing: number;

  @ApiProperty()
  totalSightseeingSeries: number[];

  @ApiProperty()
  areaQrWaitingSeries: number[];

  @ApiProperty()
  areaQrApprovedSeries: number[];

  @ApiProperty()
  areaQrSellingSeries: number[];

  @ApiProperty()
  barHarvestCollectedSeries: number[];

  @ApiProperty()
  barHarvestRemainSeries: number[];
}

