import { ApiProperty } from '@nestjs/swagger';

export class GuestResDto {
  @ApiProperty({ example: 1 })
  insertId: number;

  @ApiProperty({ example: 'Request sent successfully' })
  message: string;
}
