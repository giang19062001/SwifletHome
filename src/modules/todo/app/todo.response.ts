import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsArray, IsEnum } from 'class-validator';
import { YnEnum } from 'src/interfaces/admin.interface';
import { UserHomeResDto } from '../../userHome/app/userHome.response';
import { TaskLeftEventEnum, TaskRightEventEnum, TaskStatusEnum } from '../common/todo.enum';
import { HarvestDataInputDto } from './todo.dto';

export class TodoHomeDataResDto extends OmitType(UserHomeResDto, ['isIntegateTempHum', 'isIntegateCurrent', 'isTriggered', 'uniqueId'] as const) {}

export class GetTaskResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  taskCode: string;

  @ApiProperty({ example: '' })
  taskName: string;
}

export class GetHarvestTaskPhaseResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  harvestCode: string;

  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  userHomeCode: string;

  @ApiProperty({ example: 0 })
  harvestPhase: number;

  @ApiProperty({ example: 2025 })
  harvestYear: number;

  @ApiProperty({ example: '2026-01-01', type: String, format: 'date' })
  taskDate: string;

  @ApiProperty({ example: TaskStatusEnum.WAITING, enum: TaskStatusEnum })
  taskStatus: TaskStatusEnum;

  @ApiProperty({
    example: YnEnum.N,
    enum: YnEnum,
  })
  isUse: YnEnum;
}

export class GetTaskAlarmResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  taskAlarmCode: string;

  @ApiProperty({ example: '' })
  taskCode: string | null;

  @ApiProperty({ example: '' })
  taskName: string;

  @ApiProperty({ example: '' })
  taskKeyword: string;

  @ApiProperty({ example: '' })
  userCode?: string;

  @ApiProperty({ example: '' })
  userHomeCode: string;

  @ApiProperty({ example: '' })
  userHomeName: string;

  @ApiProperty({ example: '2026-01-01', type: String, format: 'date' })
  taskDate: Date;

  @ApiProperty({ example: TaskStatusEnum.WAITING, enum: TaskStatusEnum })
  @IsEnum(TaskStatusEnum)
  taskStatus: TaskStatusEnum;

  @ApiProperty({ example: '' })
  taskNote: string;

  @ApiProperty({
    example: YnEnum.Y,
    enum: YnEnum,
  })
  isActive: YnEnum;
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
  userHomeName: string;

  @ApiProperty({ example: '' })
  taskAlarmCode: string;

  @ApiProperty({ example: '2026-01-01' })
  harvestNextDate: string;

  @ApiProperty({ example: 1 })
  harvestPhase: number;

  @ApiProperty({ example: 'Y' })
  isComplete: string;

  @ApiProperty({ type: () => HarvestDataInputDto, isArray: true })
  harvestData: HarvestDataInputDto[];
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

export class GetTasksMedicineRowResDto extends GetTasksMedicineResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  medicineCode: string;

  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  userHomeCode: string;

  @ApiProperty({ example: '2026-01-01', type: String, format: 'date' })
  taskDate: string;

  @ApiProperty({ example: TaskStatusEnum.WAITING, enum: TaskStatusEnum })
  taskStatus: TaskStatusEnum;
}

export class GetListTaskHarvestResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  taskAlarmCode: string;

  @ApiProperty({ example: '' })
  userHomeCode: string;

  @ApiProperty({ example: 0 })
  harvestPhase: number;

  @ApiProperty({ example: 2020 })
  harvestYear: number;

  @ApiProperty({ example: 1 })
  totalFloor: number;

  @ApiProperty({ example: 0 })
  totalCellCollected: number;

  @ApiProperty({ example: 0 })
  totalCellRemain: number;
}

export class GetInfoTaskHarvestForAdjustResDto {
  @ApiProperty({ example: '' })
  seq: number;

  @ApiProperty({ example: '' })
  userHomeCode: string;

  @ApiProperty({ example: 0 })
  harvestPhase: number;

  @ApiProperty({ example: 0 })
  harvestYear: number;

  @ApiProperty({ type: () => TodoHomeDataResDto })
  homeData: TodoHomeDataResDto;

  @ApiProperty({ type: () => [HarvestDataInputDto] })
  @IsArray()
  harvestData: HarvestDataInputDto[];
}
export class TodoBoxTaskAppResDto {
  @ApiProperty({ example: 0 })
  seq: number;
  @ApiProperty({ example: '' })
  taskCode: string;
  @ApiProperty({ example: '' })
  taskName!: string;
  @ApiProperty({ example: 0 })
  sortOrder: number;
  @ApiProperty({ example: YnEnum.N })
  isActive: YnEnum;
}
export class TodoTaskAppResDto {
  @ApiProperty({ example: 0 })
  seq: number;
  @ApiProperty({ example: '' })
  taskCode: string;
  @ApiProperty({ example: '' })
  taskName: string;
  @ApiProperty({ example: '' })
  taskKeyword: string;
  @ApiProperty({ example: YnEnum.N })
  isActive: YnEnum;
  @ApiProperty({ example: new Date() })
  createdAt: Date;
  @ApiProperty({ example: new Date() })
  updatedAt: Date;
  @ApiProperty({ example: '' })
  createdId: string;
  @ApiProperty({ example: '' })
  updatedId: string;
}
export class TodoTaskAlramAppResDto {
  @ApiProperty({ example: '' })
  taskAlarmCode!: string;
  @ApiProperty({ example: '' })
  taskKeyword!: string;
  @ApiProperty({ example: '' })
  userCode!: string;
  @ApiProperty({ example: '' })
  taskCode: string | null;
  @ApiProperty({ example: '' })
  userHomeCode: string;
  @ApiProperty({ example: '' })
  taskName: string;
  @ApiProperty({ example: new Date() })
  taskDate: Date;
  @ApiProperty({ example: '' })
  taskStatus: TaskStatusEnum;
  @ApiProperty({ example: '' })
  taskNote: string;
}
export class HandleAlarmDataAppResDto {
  userHomeCode: string;
  taskCode: string | null;
  taskName: string;
  taskNote: string;
  taskDate: Date;
  taskStatus: TaskStatusEnum;
}
