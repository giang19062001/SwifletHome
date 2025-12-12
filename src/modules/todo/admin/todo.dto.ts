import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';

export class UpdateBoxTaskDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  taskCode: string;

  @ApiProperty({
    example: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  seq: number;
}

export class UpdateBoxTaskArrayDto {
  @ApiProperty({ type: [UpdateBoxTaskDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBoxTaskDto)
  boxTasksArray: UpdateBoxTaskDto[];
}
