import { ApiProperty } from "@nestjs/swagger";

export class ResProvinceDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  provinceCode: string;

  @ApiProperty({ example: '' })
  provinceName: string;

}
