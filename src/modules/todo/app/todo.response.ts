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

export class GetListTaskAlarmsResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  userHomeCode: string;

  @ApiProperty({ example: '' })
  taskAlarmCode: string;

  @ApiProperty({ example: '' })
  taskPeriodCode: string;

  @ApiProperty({ example: '' })
  taskName: string;

  @ApiProperty({
    example: '2025-12-01',
  })
  taskDate: Date

  @ApiProperty({
    example: TaskStatusEnum.WAITING,
    enum: TaskStatusEnum,
  })
  taskStatus: TaskTypeEnum;
}
