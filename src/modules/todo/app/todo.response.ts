import { ApiProperty } from '@nestjs/swagger';
import { YnEnum } from 'src/interfaces/admin.interface';
import { TaskStatusEnum } from '../todo.interface';

export class GetTaskResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  taskCode: string;

  @ApiProperty({ example: '' })
  taskName: string;
}

export class GetScheduledTasksResDto {
  @ApiProperty({ example: 'Thu hoạch' })
  label: string;

  @ApiProperty({ example: '_ / _' })
  value: string;

  @ApiProperty({ example: '2025-12-12' })
  date: string;

  @ApiProperty({ example: 'ngày' })
  unit: string;
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
  taskDate: Date;

  @ApiProperty({
    example: TaskStatusEnum.WAITING,
    enum: TaskStatusEnum,
  })
  taskStatus: TaskStatusEnum;

  @ApiProperty({ example: 'Đang chờ' })
  taskStatusTxt: string;

  @ApiProperty({ example: '' })
  taskNote: string;

  @ApiProperty({
    example: YnEnum.Y,
    enum: YnEnum,
  })
  isActive: YnEnum;
}
