import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { HarvestDataDto } from 'src/modules/todo/app/todo.dto';

export class GetInfoToRequestQrcodeResDto {
  @ApiProperty({ example: '' })
  userName: string;

  @ApiProperty({ example: '' })
  userHomeCode: string;

  @ApiProperty({ example: 10 })
  userHomeLength: number;

  @ApiProperty({ example: 10 })
  userHomeWidth: number;

  @ApiProperty({ example: 1 })
  userHomeFloor: number;

  @ApiProperty({ example: '' })
  userHomeAddress: string;

  @ApiProperty({ example: 10 })
  temperature: number;

  @ApiProperty({ example: 10 })
  humidity: number;

  @ApiProperty({ type: () => [TaskMedicineQrResDto] })
  @IsArray()
  taskMedicineList: TaskMedicineQrResDto[];

  @ApiProperty({ type: () => [TaskHarvestQrResDto] })
  @IsArray()
  taskHarvestList: TaskHarvestQrResDto[];
}

export class TaskMedicineQrResDto {
  @ApiProperty({ example: '' })
  medicineTaskAlarmCode: string;

  @ApiProperty({ example: '' })
  medicineName: string; // medicineOptionCode or  medicineOther

  @ApiProperty({ example: '' })
  medicineUsage: string;

  @ApiProperty({ example: '20-11-2025' })
  timestamp: string;
}

export class TaskHarvestQrResDto {
  @ApiProperty({ example: '' })
  harvestTaskAlarmCode: string;

  @ApiProperty({ example: 1 })
  harvestPhase: number;

  @ApiProperty({ example: 2026 })
  harvestYear: number;

  @ApiProperty({ type: () => HarvestDataDto })
  @IsArray()
  harvestData: HarvestDataDto[];
}
