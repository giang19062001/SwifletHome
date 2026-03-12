import { ApiProperty } from "@nestjs/swagger";

export class GetProvinceResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  provinceCode: string;

  @ApiProperty({ example: '' })
  provinceName: string;

}

export class ProvinceResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: 0 })
    provinceCode: number;
    @ApiProperty({ example: '' })
    provinceName: string;
    @ApiProperty({ example: new Date() })
    createdAt: Date;
}
