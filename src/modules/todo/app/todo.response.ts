import { ApiProperty } from '@nestjs/swagger';
import { YnEnum } from 'src/interfaces/admin.interface';
import { TaskStatusEnum, TaskTypeEnum } from './todo.dto';

export class GetTaskResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  taskCode: string;

  @ApiProperty({ example: '' })
  taskName: string;
}

class TaskKeyDto {
  @ApiProperty({ example: 'harvest' })
  key: string;

  @ApiProperty({ example: 'Thu hoạch' })
  text: string;
}

export class GetListTaskAlarmsResDto {
  @ApiProperty({ example: 0 })
  seq: number;
  
  @ApiProperty({ example: '' })
  taskAlarmCode: string;

  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  userHomeCode: string;

  @ApiProperty({ example: null })
  taskCode: string | null;

  @ApiProperty({
    example: YnEnum.Y,
    enum: YnEnum,
  })
  isCustomTask: YnEnum;

  @ApiProperty({ example: '' })
  taskCustomName: string;

  @ApiProperty({
    example: TaskTypeEnum.SPECIFIC,
    enum: TaskTypeEnum,
  })
  taskType: TaskTypeEnum;

  @ApiProperty({
    example: TaskStatusEnum.WAITING,
    enum: TaskStatusEnum,
  })
  taskStatus: TaskTypeEnum;

  @ApiProperty({
    example: null,
  })
  periodValue: number | null;

  @ApiProperty({
    example: '2025-12-01',
  })
  specificValue: Date | null;
}

export class GetScheduledTasksResDto {
  @ApiProperty({
    type: [TaskKeyDto],
    example: [
      { key: 'harvest', text: 'Thu hoạch' },
      { key: 'rollMedicine', text: 'Lăn thuốc' },
      { key: 'luringBird', text: 'Chim đêm' },
    ],
  })
  keys: TaskKeyDto[];

  @ApiProperty({
    example: {
      harvest: 'NaN',
      rollMedicine: '3',
      luringBird: '6',
    },
  })
  values: Record<string, string>;
}
