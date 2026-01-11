import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { PagingDto } from 'src/dto/admin.dto';
import { YnEnum } from 'src/interfaces/admin.interface';
import { PeriodTypeEnum, TaskStatusEnum } from '../todo.interface';

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
  @IsOptional()
  userCode?: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userHomeCode: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsOptional()
  taskPeriodCode: string | null;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsOptional()
  taskCode: string | null;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  taskName: string;

  @ApiProperty({
    example: '2025-12-01',
    type: String,
    format: 'date',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value === null ? null : new Date(value + 'T00:00:00')))
  @IsDate()
  taskDate: Date | null;

  @ApiProperty({
    example: TaskStatusEnum.WAITING,
    enum: TaskStatusEnum,
  })
  @IsNotEmpty()
  @IsEnum(TaskStatusEnum)
  taskStatus: TaskStatusEnum;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsOptional()
  taskNote: string;
}
export class SetTaskPeriodDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userHomeCode: string;

  @ApiProperty({
    example: null,
    nullable: true,
    required: false,
  })
  @IsString()
  @IsOptional()
  taskCode: string | null;

  @ApiProperty({
    example: YnEnum.Y,
    enum: YnEnum,
  })
  @IsEnum(YnEnum)
  @IsNotEmpty()
  isCustomTask: YnEnum;

  @ApiProperty({
    example: 'Kiểm tra camera',
  })
  @IsString()
  @IsOptional()
  taskCustomName: string;

  @ApiProperty({
    example: YnEnum.N,
    enum: YnEnum,
  })
  @IsEnum(YnEnum)
  @IsNotEmpty()
  isPeriod: YnEnum;

  @ApiProperty({
    example: null,
    enum: PeriodTypeEnum,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(PeriodTypeEnum)
  periodType: PeriodTypeEnum | null;

  @ApiProperty({
    example: null,
    nullable: true,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  periodValue: number | null;

  @ApiProperty({
    example: '2025-12-01',
    type: String,
    format: 'date',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value === null ? null : new Date(value + 'T00:00:00')))
  @IsDate()
  specificValue: Date | null;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsOptional()
  taskNote: string;
}

export class CompleteMedicineTaskDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  taskAlarmCode: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  medicineNote: string;
}

export class CompleteHarvestTaskDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  taskAlarmCode: string;

  @ApiProperty({ type: () => HarvestDataDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HarvestDataDto)
  harvestData: HarvestDataDto[];

  @ApiProperty({
    example: YnEnum.N,
    enum: YnEnum,
  })
  @IsEnum(YnEnum)
  @IsNotEmpty()
  isComplete: YnEnum;
}

export class HarvestDataDto {
  @ApiProperty({ example: 0 })
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
  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  cell: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  cellData: number;
}

export class HarvestDataRowDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  taskAlarmCode: string;

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
  cellData: number;
}
