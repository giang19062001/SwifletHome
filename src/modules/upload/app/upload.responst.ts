import { ApiProperty } from '@nestjs/swagger';

export class GetAllMediaResDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: '' })
  notificationId: string;

  @ApiProperty({ example: '' })
  messageId: string;

  @ApiProperty({ example: '' })
  title: string;

  @ApiProperty({ example: '' })
  body: string;

  @ApiProperty({ example: null })
  data: any | null;

}
