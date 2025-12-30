import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, Matches, ValidateNested } from 'class-validator';
import { SentTypeEnum } from 'src/modules/notification/admin/notification.dto';

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

export class SetTaskAlarmByAdminDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  taskName: string;

 @ApiProperty({
    example: '2025-12-30',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/) // YYYY-MM-DD
  taskDate: string;

  @ApiProperty({
    example: [],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  userCodesMuticast: string[];

  @ApiProperty({
    example: [],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  provinceCodesMuticast: string[];

  @ApiProperty({
    example: 'N',
    enum: SentTypeEnum,
  })
  @IsNotEmpty()
  @IsEnum(SentTypeEnum)
  sendType: SentTypeEnum;
}
