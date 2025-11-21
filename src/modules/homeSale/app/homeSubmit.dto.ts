import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { YnEnum } from 'src/interfaces/admin.interface';

export class CreateHomeSubmitDto {
  @ApiProperty({
    example: 'HOM000001',
  })
  @IsString()
  @IsNotEmpty()
  homeCode: string;

  @ApiProperty({
    example: 'Giang',
  })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    example: '0334644324',
  })
  @IsString()
  @IsNotEmpty()
  userPhone: string;

  @ApiProperty({
    example: 'COD000003',
  })
  @IsString()
  @IsNotEmpty()
  numberAttendCode: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  note: string;
}
class ResHomeImagesDto {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: '' })
  filename: string;

  @ApiProperty({ example: '' })
  mimetype: string;
}
export class ResHomeDto {
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

  @ApiProperty({ type: [ResHomeImagesDto], isArray: true, example: [{ seq: 0, filename: '', mimetype: '' }] })
  homeImages: ResHomeImagesDto[];
}
