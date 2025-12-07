import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
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

export class SetupTodoTaskDto {
  // @ApiProperty({
  //   example: '',
  // })
  // @IsString()
  // @IsNotEmpty()
  // userCode: string;
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
    example: TaskTypeEnum.SPECIFIC,
    enum: TaskTypeEnum,
  })
  @IsNotEmpty()
  @IsEnum(TaskTypeEnum)
  taskType: TaskTypeEnum;

  // @ApiProperty({
  //   example: TaskStatusEnum.WAITING,
  //   enum: TaskStatusEnum,
  // })
  // @IsNotEmpty()
  // @IsEnum(TaskStatusEnum)
  // taskStatus: TaskStatusEnum;

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
}
