import { ApiProperty } from '@nestjs/swagger';

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
      harvest: 'NAN',
      rollMedicine: '3 ngày',
      luringBird: '6 ngày',
    },
  })
  values: Record<string, string>;
}
