import { ApiProperty } from "@nestjs/swagger";


export class GetContentScreenResDto {
  @ApiProperty()
  contentStart: string;

  @ApiProperty()
  contentCenter: any;

  @ApiProperty()
  contentEnd: string;
}