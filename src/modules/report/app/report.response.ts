import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CellCollectedByfloorDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  floor: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  cell: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsNotEmpty()
  cellCollected: number;
}
export class GetHarvertReportSummaryResDto {
  @ApiProperty()
  harvestPhase: number;

  @ApiProperty()
  totalCellCollected: number;

  static mock(): GetHarvertReportSummaryResDto {
    return {
      harvestPhase: 1,
      totalCellCollected: 100,
    };
  }
}
export class GetHarvertReportDetailResDto {
  @ApiProperty()
  harvestPhase: number;

  @ApiProperty()
  totalCellCollected: number;

  @ApiProperty({
    type: () => CellCollectedByfloorDto,
    isArray: true
  })
  cellCollectedByfloor: CellCollectedByfloorDto[];

  static mock(): GetHarvertReportDetailResDto {
    return {
      harvestPhase: 1,
      totalCellCollected: 100,
      cellCollectedByfloor: [{ floor: 1, cell: 1, cellCollected: 100 }],
    };
  }
}
