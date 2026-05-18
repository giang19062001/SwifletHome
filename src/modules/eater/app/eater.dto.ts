import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EaterEntryDto {
  @ApiProperty({ example: 'device-token-xyz-123', description: 'Device token của thiết bị người ăn yến' })
  @IsString()
  @IsNotEmpty()
  deviceToken: string;
}
