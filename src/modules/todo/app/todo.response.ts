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
  @ApiProperty({ example: 'NA' })
  harvest: string;

  @ApiProperty({ example: 'NA' })
  rollMedicine: string;

  @ApiProperty({ example: 'NA' })
  luringBird: string;
}
