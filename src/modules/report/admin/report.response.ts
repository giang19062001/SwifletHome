import { ApiProperty } from '@nestjs/swagger';

export class ReportOverviewResDto {
  @ApiProperty()
  totalUser: number;

  @ApiProperty()
  totalUserHome: number;

  @ApiProperty()
  totalGuestConsulation: number;

  @ApiProperty()
  totalConsignment: number;
}
