import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PagingDto } from 'src/dto/common';
import { IsFreeEnum } from 'src/interfaces/common';

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
    example: 'YEN',
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

export class CreateAnswerDto extends OmitType(UpdateAnswerDto, ['updatedId']) {
  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  createdId: string;
}
