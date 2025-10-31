import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateHomeDto {
  @ApiProperty({
    example: 'home',
    enum: ['home'],
    default: 'home',
  })
  @IsEnum(['home'])
  @IsNotEmpty()
  source: 'home';

  @ApiProperty({
    example: 'New',
  })
  @IsString()
  @IsNotEmpty()
  homeName: string;

  @ApiProperty({
    example: 'District 8',
  })
  @IsString()
  @IsNotEmpty()
  homeAddress: string;

  @ApiProperty({
    example: '<p>hello</p>',
  })
  @IsString()
  @IsNotEmpty()
  homeDescription: string;

  @ApiProperty({
    example: 10.12345,
  })
  @IsNumber()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return value;
    }
    return Number(value);
  })
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    example: 106.12345,
  })
  @IsNumber()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return value;
    }
    return Number(value);
  })
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  createdId: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  homeImage: any;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  homeImages: any[];
}

export class UpdateHomeDto extends OmitType(CreateHomeDto, ['createdId']) {
  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  updatedId: string;
}
