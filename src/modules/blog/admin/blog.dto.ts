import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PagingDto } from 'src/dto/common';
import { IsFreeEnum } from 'src/interfaces/common';

export class GetAllBlogDto extends PagingDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  blogCategory: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  blogObject: string;
}

export class UpdateBlogDto {
  @ApiProperty({ example: '<p>Hello word</p>' })
  @IsNotEmpty()
  @IsString()
  blogContent: string;

  @ApiProperty({
    example: 'SWIFTLET',
  })
  @IsString()
  @IsNotEmpty()
  blogObject: string;

  @ApiProperty({
    example: 'CAQ001',
  })
  @IsString()
  @IsNotEmpty()
  blogCategory: string;

   @ApiProperty({
    example: IsFreeEnum.Y,
    enum: IsFreeEnum,
  })
  @IsEnum(IsFreeEnum)
  @IsNotEmpty()
  isFree: IsFreeEnum;

  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  updatedId: string;
}

export class CreateBlogDto extends OmitType(UpdateBlogDto, ['updatedId']) {
  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  createdId: string;
}
