import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class ControlSensorCommandDto {
  @ApiPropertyOptional({ description: 'Bật/tắt đèn (0 hoặc 1)', example: 1 })
  @IsOptional()
  @IsIn([0, 1])
  light?: number;

  @ApiPropertyOptional({ description: 'Bật/tắt quạt (0 hoặc 1)', example: 1 })
  @IsOptional()
  @IsIn([0, 1])
  fan?: number;

  @ApiPropertyOptional({ description: 'Bật/tắt bơm (0 hoặc 1)', example: 0 })
  @IsOptional()
  @IsIn([0, 1])
  pump?: number;
}
