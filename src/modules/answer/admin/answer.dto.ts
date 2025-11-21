import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PagingDto } from 'src/dto/admin.dto';
import { YnEnum } from 'src/interfaces/admin.interface';

export class GetAllAnswerDto extends PagingDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  answerCategory: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  answerObject: string;
}

export class UpdateAnswerDto {
  @ApiProperty({ example: '<p>Hello word</p>' })
  @IsNotEmpty()
  @IsString()
  answerContent: string;

  @ApiProperty({
    example: 'SWIFTLET',
  })
  @IsString()
  @IsNotEmpty()
  answerObject: string;

  @ApiProperty({
    example: 'CAQ001',
  })
  @IsString()
  @IsNotEmpty()
  answerCategory: string;

   @ApiProperty({
    example: YnEnum.Y,
    enum: YnEnum,
  })
  @IsEnum(YnEnum)
  @IsNotEmpty()
  isFree: YnEnum;

  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  updatedId: string;
}

export class CreateAnswerDto extends OmitType(UpdateAnswerDto, ['updatedId']) {
  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  createdId: string;
}
