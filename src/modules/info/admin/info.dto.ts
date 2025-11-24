import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNotEmptyObject, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class UpdateInfoDto {
  @ApiProperty({
    example: '',
  })
  @IsNotEmpty()
  infoContent: string; // luôn là string vì gửi bằng FormData (JSON.stringfy())
}
