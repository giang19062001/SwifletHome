import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateInfoDto {
  @ApiProperty({
    example: '',
  })
  @IsNotEmpty()
  infoContent: string; // luôn là string vì gửi bằng FormData (JSON.stringfy())
}
