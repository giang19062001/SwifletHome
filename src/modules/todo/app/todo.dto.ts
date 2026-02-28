import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsDate, IsDefined, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { PagingDto } from 'src/dto/admin.dto';
import { YnEnum } from 'src/interfaces/admin.interface';
import { PeriodTypeEnum, TaskStatusEnum } from '../todo.interface';
import { IsTodayOrAfter } from 'src/decorator/validate.decorator';
import { Msg } from 'src/helpers/message.helper';

export class GetListTaskAlarmsDTO extends PagingDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userHomeCode: string;
}
export class ChangeTaskAlarmStatusDto {
  @ApiProperty({
    example: TaskStatusEnum.COMPLETE,
    enum: TaskStatusEnum,
  })
  @IsNotEmpty()
  @IsEnum(TaskStatusEnum)
  taskStatus: TaskStatusEnum;
}

export class SetTaskAlarmDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userHomeCode: string;

  @ApiProperty({
    example: 'Kiểm tra camera',
  })
  @IsString()
  @IsNotEmpty()
  taskCustomName: string;

  @ApiProperty({
    example: '2026-01-01',
    type: String,
    format: 'date',
    required: true,
  })
  @IsDefined({ message: 'specificValue is required' })
  @IsNotEmpty({ message: 'specificValue cannot be null or empty' })
  @Transform(({ value }) => new Date(value + 'T00:00:00'))
  @IsDate({ message: 'specificValue must be a valid date' })
  specificValue: Date;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsOptional()
  taskNote: string;
}

export class SetHarvestTaskDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  taskAlarmCode: string;

  @ApiProperty({
    example: '2026-01-01',
    type: String,
    format: 'date',
    required: true,
  })
  @IsDefined({ message: 'harvestNextDate is required' })
  @IsNotEmpty({ message: 'harvestNextDate cannot be null or empty' })
  @Transform(({ value }) => new Date(value + 'T00:00:00'))
  @IsDate({ message: 'harvestNextDate must be a valid date' })
  @IsTodayOrAfter({ message: 'harvestNextDate must be today or later' })
  harvestNextDate: Date;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  harvestPhase: number;

  @ApiProperty({
    example: YnEnum.N,
    enum: YnEnum,
  })
  @IsEnum(YnEnum)
  @IsNotEmpty()
  isComplete: YnEnum;

  @ApiProperty({ type: () => HarvestDataDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HarvestDataDto)
  harvestData: HarvestDataDto[];
}

export class HarvestDataDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  floor: number;

  @ApiProperty({ type: () => FloorDataDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FloorDataDto)
  floorData: FloorDataDto[];
}

export class FloorDataDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  cell: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsNotEmpty()
  cellCollected: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @IsNotEmpty()
  cellRemain: number;
}

export class HarvestDataRowDto {
  @ApiProperty({ example: 0 })
  @IsString()
  @IsNotEmpty()
  seqAlarm: number;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  userCode: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  userHomeCode: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  floor: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  cell: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  cellCollected: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  cellRemain: number;
}

export class SetTaskMedicineDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsOptional()
  taskAlarmCode: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  medicineOptionCode: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsOptional()
  medicineOther: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty({ message: Msg.medicineUsageCannotBlank})
  medicineUsage: string;

  @ApiProperty({
    example: '2026-01-01',
    type: String,
    format: 'date',
    required: true,
  })
  @IsDefined({ message: 'medicineNextDate is required' })
  @IsNotEmpty({ message: 'medicineNextDate cannot be null or empty' })
  @Transform(({ value }) => new Date(value + 'T00:00:00'))
  @IsDate({ message: 'medicineNextDate must be a valid date' })
  @IsTodayOrAfter({ message: 'medicineNextDate must be today or later' })
  medicineNextDate: Date;
}
