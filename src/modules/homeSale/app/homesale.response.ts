import { ApiProperty, OmitType } from '@nestjs/swagger';
import { YnEnum } from 'src/interfaces/admin.interface';

class HomeImagesResDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: '' })
  filename: string;

  @ApiProperty({ example: '' })
  mimetype: string;
}

class HomeImagesDemensionResDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: '' })
  filename: string;

  @ApiProperty({ example: '' })
  mimetype: string;

  @ApiProperty({ example: 0 })
  width: number;

  @ApiProperty({ example: 0 })
  height: number;
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

export class GetHomeSaleDetailResDto extends OmitType(GetHomeSaleResDto, ['homeImages'] as const) {
  @ApiProperty({
    type: [HomeImagesDemensionResDto],
    isArray: true,
    example: [{ seq: 0, filename: '', mimetype: '', width: 0, height: 0 }],
  })
  homeImages: HomeImagesDemensionResDto[];
}
