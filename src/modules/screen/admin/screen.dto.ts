import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNotEmptyObject, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ScreenContentDto {
  @ApiProperty({ example: 'Nội dung đầu' })
  @IsString()
  @IsOptional()
  contentStart: string;

  @ApiProperty({ example: 'Nội dung giữa' })
  @IsObject()
  @IsOptional()
  contentCenter: any;

  @ApiProperty({ example: 'Nội dung cuối' })
  @IsString()
  @IsOptional()
  contentEnd: string;
}

export class UpdateScreenDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  screenName: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  screenDescription: string;

  @ApiProperty({
    example: {
      contentStart: 'a',
      contentCenter: {},
      contentEnd: 'b',
    },
    type: ScreenContentDto,
  })
  @IsObject()
  @Type(() => ScreenContentDto)
  screenContent: ScreenContentDto;
}
