import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
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
  @IsString()
  @IsOptional()
  userCode?: string;

  @IsString()
  @IsOptional()
  taskPeriodCode: string | null;

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
