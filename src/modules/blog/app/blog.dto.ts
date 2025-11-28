import { ApiProperty } from '@nestjs/swagger';
export class ResBlogDto {
  @ApiProperty()
  blogCode: string;

  @ApiProperty()
  blogName: string;

  @ApiProperty()
  blogContent: string;
}
