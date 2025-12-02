import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { YnEnum } from 'src/interfaces/admin.interface';

export enum TaskTypeEnum {
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  SPECIFIC = 'SPECIFIC',
}

export enum TaskStatusEnum {
  WAITING = 'WAITING',
  COMPLETE = 'COMPLETE',
  CANCEL = 'CANCEL',
}

export class CreateHomeSightSeeingDto {
  @ApiProperty({
    example: null,
    nullable: true,
    required: false,
  })
  @IsOptional()
  taskCode: string | null;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userCode: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userHomeCode: string;

  @ApiProperty({
    example: YnEnum.Y,
    enum: YnEnum,
  })
  @IsEnum(YnEnum)
  @IsNotEmpty()
  isCustomTask: YnEnum;

  @ApiProperty({
    example: null,
    nullable: true,
    required: false,
  })
  @IsOptional()
  taskCustomName: string | null;

  @ApiProperty({
    example: TaskTypeEnum.SPECIFIC,
    enum: TaskTypeEnum,
  })
  @IsNotEmpty()
  @IsEnum(TaskTypeEnum)
  taskType: TaskTypeEnum;

  @ApiProperty({
    example: TaskStatusEnum.WAITING,
    enum: TaskStatusEnum,
  })
  @IsNotEmpty()
  @IsEnum(TaskStatusEnum)
  taskStatus: TaskStatusEnum;

  @ApiProperty({
    example: null,
    nullable: true,
    required: false,
  })
  @IsOptional()
  periodValue: number | null;

  @ApiProperty({
    example: '2025-12-02 08:30:00',
    type: String,
    format: 'date-time',
    nullable: true,
    required: false,
  })
  @IsOptional()
  specificValue: string | null;
}