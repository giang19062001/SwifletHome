import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, Matches, IsOptional, ValidateIf, IsDate } from 'class-validator';

export class CreateUserPaymentDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userCode: string;

  @ApiProperty({
    example: null,
    required: false,
    nullable: true,
  })
  @ValidateIf((_, value) => value !== null) // bỏ qua validate khi value string === null
  @IsString()
  packageCode: string | null;

  @ApiPropertyOptional({
    example: '2025-11-09T08:00:00Z',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date) // convert string -> Date
  @IsDate() // chỉ validate nếu có giá trị
  startDate: Date | null;

  @ApiPropertyOptional({
    example: '2025-11-09T18:00:00Z',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate: Date | null;
}
