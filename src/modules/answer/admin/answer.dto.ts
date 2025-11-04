import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PagingDto } from 'src/dto/common';
import { IsFreeEnum } from 'src/interfaces/common';

export class GetAllAnswerDto extends PagingDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  categoryAnsCode: string;

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
  answerContentRaw: string;

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
  categoryAnsCode: string;

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
