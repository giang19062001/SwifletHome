import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PagingDto } from 'src/dto/admin.dto';
import { YnEnum } from 'src/interfaces/admin.interface';

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
   @ApiProperty({
    example: '',
  })
  @IsString()
  blogName: string;

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
    example: YnEnum.Y,
    enum: YnEnum,
  })
  @IsEnum(YnEnum)
  @IsNotEmpty()
  isFree: YnEnum;
}

export class CreateBlogDto extends UpdateBlogDto {}
