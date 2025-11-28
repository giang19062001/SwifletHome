import { ApiProperty } from "@nestjs/swagger";
import { YnEnum } from "src/interfaces/admin.interface";

class HomeImagesResDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: '' })
  filename: string;

  @ApiProperty({ example: '' })
  mimetype: string;
}

export class GetHomeSaleResDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: '' })
  homeCode: string;

  @ApiProperty({ example: '' })
  homeName: string;

  @ApiProperty({ example: '' })
  homeAddress: string;

  @ApiProperty({ example: '' })
  homeDescription: string;

  @ApiProperty({ example: 0 })
  latitude: number;

  @ApiProperty({ example: 0 })
  longitude: number;

  @ApiProperty({ example: '' })
  homeImage: string;

  @ApiProperty({ example: YnEnum.Y })
  isActive: YnEnum;

  @ApiProperty({ type: [HomeImagesResDto], isArray: true, example: [{ seq: 0, filename: '', mimetype: '' }] })
  homeImages: HomeImagesResDto[];
}
