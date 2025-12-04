import { ApiProperty } from '@nestjs/swagger';

export class GetTaskResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  taskCode: string;

  @ApiProperty({ example: '' })
  taskName: string;
}

export class GetScheduledTasksResDto {
  @ApiProperty({
    example: ['harvest', 'rollMedicine', 'luringBird'],
    type: [String],
  })
  keys: string[];

  @ApiProperty({
    example: {
      harvest: 'NA',
      rollMedicine: '3 Ngày',
      luringBird: '5 Ngày',
    },
  })
  values: Record<string, string>;
}
