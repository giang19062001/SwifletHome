import { ApiProperty } from '@nestjs/swagger';
import { YnEnum } from 'src/interfaces/admin.interface';
import { TaskLeftEventEnum, TaskRightEventEnum, TaskStatusEnum } from '../todo.interface';
import { HarvestDataDto } from './todo.dto';

export class GetTaskResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  taskCode: string;

  @ApiProperty({ example: '' })
  taskName: string;
}

export class GetScheduledTasksResDto {
  @ApiProperty({ example: '' })
  taskAlarmCode: string;

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
  taskCode: string;

  @ApiProperty({ example: '' })
  taskName: string;

  @ApiProperty({
    example: '2025-12-01',
  })
  taskDate: Date;

  @ApiProperty({ example: '' })
  taskNote: string;

  @ApiProperty({
    example: YnEnum.Y,
    enum: YnEnum,
  })
  isActive: YnEnum;

  @ApiProperty({
    example: TaskStatusEnum.WAITING,
    enum: TaskStatusEnum,
  })
  taskStatus: TaskStatusEnum;

  @ApiProperty({ example: 'Đang chờ' })
  taskStatusLabel: string;

  @ApiProperty({
    example: TaskLeftEventEnum.CANCEL,
    enum: TaskLeftEventEnum,
  })
  leftEvent: TaskLeftEventEnum;

  @ApiProperty({ example: 'Hủy' })
  leftEventLabel: string;

  @ApiProperty({
    example: TaskRightEventEnum.COMPLETE,
    enum: TaskRightEventEnum,
  })
  rightEvent: TaskRightEventEnum;

  @ApiProperty({ example: 'Hoàn thành' })
  rightEventLabel: string;
}

export class GetTaskHarvestResDto {
  @ApiProperty({ example: '' })
  taskAlarmCode: string;

  @ApiProperty({ example: '2026-01-01' })
  harvestNextDate: string;

  @ApiProperty({ example: 1 })
  harvestPhase: number;

  @ApiProperty({ example: 'N' })
  isComplete: string

  @ApiProperty({ type: () => HarvestDataDto, isArray: true })
  harvestData: HarvestDataDto[];
}

export class GetTasksMedicineResDto {
  @ApiProperty({ example: '' })
  taskAlarmCode: string;

  @ApiProperty({ example: 'COD000005' })
  medicineOptionCode: string;

  @ApiProperty({ example: '' })
  medicineOther: string;

  @ApiProperty({ example: '' })
  medicineUsage: string;

  @ApiProperty({ example: '2026-01-01' })
  medicineNextDate: string;
}
