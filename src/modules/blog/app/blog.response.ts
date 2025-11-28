import { ApiProperty } from '@nestjs/swagger';
export class GetContentBlogResDto {
  @ApiProperty()
  blogCode: string;

  @ApiProperty()
  blogName: string;

  @ApiProperty()
  blogContent: string;
}
