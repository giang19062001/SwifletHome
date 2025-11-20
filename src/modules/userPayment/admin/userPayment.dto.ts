import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, Matches, IsOptional, ValidateIf, IsDate } from 'class-validator';

export class UpdateUserPaymentAdminDto {
  @ApiProperty({
    example: null,
    required: false,
    nullable: true,
  })
  @ValidateIf((_, value) => value !== null) // bỏ qua validate khi value string === null
  @IsString()
  packageCode: string | null;

  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  updatedId: string;
}
