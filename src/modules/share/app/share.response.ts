import { ApiProperty } from '@nestjs/swagger';

export class GetShareLinkResDto {
  @ApiProperty()
  link: string;
}
